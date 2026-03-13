/**
 * 카카오 Local API를 이용해 stations.json의 역 좌표를 갱신하는 스크립트.
 *
 * 실행: npx tsx scripts/updateStationCoords.ts [--dry-run]
 * 환경변수: .env.local에 KAKAO_REST_API_KEY 필요
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Station } from "../src/types/station.js";

// ─── 상수 ────────────────────────────────────────────────────────────────────

const STATIONS_PATH = resolve(import.meta.dirname, "../src/data/stations.json");
const BACKUP_PATH = resolve(import.meta.dirname, "../src/data/stations.json.bak");
const ENV_PATHS = [
	resolve(import.meta.dirname, "../.env.local"),
	resolve(import.meta.dirname, "../.env"),
];

const KAKAO_API_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";
const CATEGORY_GROUP_CODE = "SW8"; // 지하철역

/** 좌표 갱신 임계값 (미터) */
const THRESHOLD_M = 11;
/** 경고 임계값 (미터, 이 이상이면 오탐 가능성 경고) */
const WARNING_DISTANCE_M = 500;
/** API 호출 간격 (ms) */
const API_DELAY_MS = 200;

// ─── 타입 ────────────────────────────────────────────────────────────────────

interface KakaoDocument {
	place_name: string;
	x: string; // 경도 (WGS84 문자열)
	y: string; // 위도 (WGS84 문자열)
	category_name: string;
}

interface KakaoSearchResponse {
	documents: KakaoDocument[];
	meta: { total_count: number };
}

interface CoordUpdateResult {
	id: string;
	name: string;
	line: number;
	oldX: number;
	oldY: number;
	newX: number;
	newY: number;
	distanceM: number;
	updated: boolean; // 임계값 초과 → 갱신 대상
	skipped: boolean; // API 응답 없음
}

// ─── 유틸 함수 ───────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}

/** 하버사인 공식으로 두 좌표 간 거리(미터)를 계산한다. */
function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
	const R = 6_371_000; // 지구 반지름 (m)
	const toRad = (deg: number) => (deg * Math.PI) / 180;
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
	return 2 * R * Math.asin(Math.sqrt(a));
}

/** .env.local 파일을 파싱하여 key=value 맵을 반환한다. */
function parseEnvFile(path: string): Record<string, string> {
	const env: Record<string, string> = {};
	try {
		const text = readFileSync(path, "utf-8");
		for (const line of text.split("\n")) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;
			const eqIdx = trimmed.indexOf("=");
			if (eqIdx === -1) continue;
			const key = trimmed.slice(0, eqIdx).trim();
			const value = trimmed
				.slice(eqIdx + 1)
				.trim()
				.replace(/^["']|["']$/g, "");
			env[key] = value;
		}
	} catch {
		// 파일 없음 → 빈 맵 반환
	}
	return env;
}

/** .env.local → .env 순서로 카카오 API 키를 로드한다. */
function loadApiKey(): string {
	for (const path of ENV_PATHS) {
		const key = parseEnvFile(path).KAKAO_REST_API_KEY;
		if (key) return key;
	}
	return process.env.KAKAO_REST_API_KEY ?? "";
}

// ─── API 호출 ─────────────────────────────────────────────────────────────────

/** 카카오 키워드 검색 API를 호출한다. 결과가 없으면 null을 반환한다. */
async function searchKakao(query: string, apiKey: string): Promise<KakaoDocument | null> {
	const url = new URL(KAKAO_API_URL);
	url.searchParams.set("query", query);
	url.searchParams.set("category_group_code", CATEGORY_GROUP_CODE);
	url.searchParams.set("size", "1");

	const res = await fetch(url.toString(), {
		headers: { Authorization: `KakaoAK ${apiKey}` },
	});

	if (!res.ok) {
		throw new Error(`카카오 API 오류: ${res.status} ${res.statusText}`);
	}

	const json = (await res.json()) as KakaoSearchResponse;
	return json.documents.at(0) ?? null;
}

/** 역 이름 + 호선으로 카카오 좌표를 조회한다. 1차 실패 시 역 이름만으로 fallback 검색한다. */
async function fetchKakaoCoord(station: Station, apiKey: string): Promise<KakaoDocument | null> {
	const primary = await searchKakao(`${station.name}역 ${station.line}호선`, apiKey);
	if (primary) return primary;
	return await searchKakao(`${station.name}역`, apiKey);
}

// ─── 역별 처리 ────────────────────────────────────────────────────────────────

/** 역 1개의 좌표를 API로 조회하고 CoordUpdateResult를 반환한다. */
async function processStation(
	station: Station,
	apiKey: string,
	index: number,
	total: number,
): Promise<CoordUpdateResult> {
	const label = `[${index + 1}/${total}] ${station.name} (${station.line}호선)`;
	const noChange: CoordUpdateResult = {
		id: station.id,
		name: station.name,
		line: station.line,
		oldX: station.x,
		oldY: station.y,
		newX: station.x,
		newY: station.y,
		distanceM: 0,
		updated: false,
		skipped: true,
	};

	let doc: KakaoDocument | null = null;
	try {
		doc = await fetchKakaoCoord(station, apiKey);
	} catch (err) {
		console.error(`  ${label} — API 호출 실패: ${err}`);
		return noChange;
	}

	if (!doc) {
		console.log(`  ${label} — 검색 결과 없음 (스킵)`);
		return noChange;
	}

	const newX = Number.parseFloat(doc.x); // 경도
	const newY = Number.parseFloat(doc.y); // 위도
	const distanceM = haversineM(station.y, station.x, newY, newX);
	const updated = distanceM > THRESHOLD_M;

	if (distanceM > WARNING_DISTANCE_M) {
		console.warn(
			`  ⚠️  ${label} — ${distanceM.toFixed(0)}m 이동 (카카오: "${doc.place_name}") ← 수동 확인 권장`,
		);
	} else if (updated) {
		console.log(`  ✓ ${label} — ${distanceM.toFixed(1)}m 이동 → 갱신 예정`);
	}

	return {
		id: station.id,
		name: station.name,
		line: station.line,
		oldX: station.x,
		oldY: station.y,
		newX,
		newY,
		distanceM,
		updated,
		skipped: false,
	};
}

// ─── 리포트 ───────────────────────────────────────────────────────────────────

function printReport(results: CoordUpdateResult[]): void {
	const updated = results.filter((r) => r.updated);
	const skipped = results.filter((r) => r.skipped);
	const warnings = results.filter((r) => r.distanceM > WARNING_DISTANCE_M);

	console.log("\n=== 결과 리포트 ===");
	console.log(`갱신 대상: ${updated.length}개`);
	console.log(`스킵 (결과 없음): ${skipped.length}개`);
	console.log(`경고 (500m 초과): ${warnings.length}개`);

	const top5 = [...results]
		.filter((r) => !r.skipped)
		.sort((a, b) => b.distanceM - a.distanceM)
		.slice(0, 5);

	console.log("\n이동 거리 Top 5:");
	for (const r of top5) {
		const tag = r.distanceM > WARNING_DISTANCE_M ? " ⚠️" : r.updated ? " ✓" : "";
		console.log(
			`  ${r.name} (${r.line}호선): ${r.distanceM.toFixed(1)}m` +
				`  (${r.oldX}, ${r.oldY}) → (${r.newX}, ${r.newY})${tag}`,
		);
	}
}

// ─── 파일 저장 ────────────────────────────────────────────────────────────────

function saveResults(stations: Station[], results: CoordUpdateResult[], rawJson: string): void {
	const updated = results.filter((r) => r.updated);
	if (updated.length === 0) {
		console.log("\n갱신할 역이 없습니다. 파일을 수정하지 않습니다.");
		return;
	}

	writeFileSync(BACKUP_PATH, rawJson, "utf-8");
	console.log(`\n백업 저장: ${BACKUP_PATH}`);

	const updateMap = new Map<string, { newX: number; newY: number }>(
		updated.map((r) => [r.id, { newX: r.newX, newY: r.newY }]),
	);

	const updatedStations: Station[] = stations.map((s) => {
		const patch = updateMap.get(s.id);
		if (!patch) return s;
		return { ...s, x: patch.newX, y: patch.newY };
	});

	writeFileSync(STATIONS_PATH, JSON.stringify(updatedStations, null, "\t"), "utf-8");
	console.log(`저장 완료: ${STATIONS_PATH}`);
	console.log(`총 ${updated.length}개 역 좌표가 갱신되었습니다.`);
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
	const isDryRun = process.argv.includes("--dry-run");

	console.log("=== 역 좌표 갱신 스크립트 ===");
	if (isDryRun) console.log("※ dry-run 모드: 파일 저장 없이 리포트만 출력합니다.\n");

	const apiKey = loadApiKey();
	if (!apiKey) {
		console.error(
			"오류: KAKAO_REST_API_KEY가 없습니다. .env.local 또는 .env에 추가하세요.\n" +
				"예) KAKAO_REST_API_KEY=your_key_here",
		);
		process.exit(1);
	}

	const rawJson = readFileSync(STATIONS_PATH, "utf-8");
	const stations = JSON.parse(rawJson) as unknown as Station[];
	console.log(`총 ${stations.length}개 역 로드 완료.\n`);

	const results: CoordUpdateResult[] = [];
	for (let i = 0; i < stations.length; i++) {
		const station = stations[i];
		if (!station) continue;
		const result = await processStation(station, apiKey, i, stations.length);
		results.push(result);
		await sleep(API_DELAY_MS);
	}

	printReport(results);

	if (isDryRun) {
		console.log("\n※ dry-run 모드: 파일 저장을 건너뜁니다.");
		return;
	}

	saveResults(stations, results, rawJson);
}

main().catch((err) => {
	console.error("스크립트 실패:", err);
	process.exit(1);
});
