import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import type { FuelPriceItem, FuelPriceResponse } from "@/lib/types";

function parsePriceString(raw: string): number {
  const cleaned = raw.replace(/\./g, "").replace(/,/g, "").trim();
  return parseInt(cleaned, 10) || 0;
}

async function fetchPVOilPrices(): Promise<{
  date: string;
  prices: FuelPriceItem[];
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch("https://www.pvoil.com.vn/tin-gia-xang-dau", {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "text/html",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) return { date: "", prices: [] };

    const html = await res.text();
    const $ = cheerio.load(html);
    const prices: FuelPriceItem[] = [];
    let date = "";

    $("table")
      .find("tr")
      .each((_i, row) => {
        const cells = $(row).find("td");
        if (cells.length >= 2) {
          const name = $(cells[0]).text().trim();
          const priceText = $(cells[1]).text().trim();
          if (
            name &&
            priceText &&
            (name.includes("Xăng") ||
              name.includes("DO") ||
              name.includes("Dầu"))
          ) {
            const price = parsePriceString(priceText);
            if (price > 0) prices.push({ name, price });
          }
        }
      });

    const headingText = $("h1, h2, h3")
      .filter((_i, el) => /\d{1,2}\/\d{1,2}\/\d{4}/.test($(el).text()))
      .first()
      .text();
    const dateMatch = headingText.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
    if (dateMatch) date = dateMatch[1];

    if (prices.length === 0) return fetchFallbackPrices();
    return { date, prices };
  } catch {
    clearTimeout(timeout);
    return fetchFallbackPrices();
  }
}

async function fetchFallbackPrices(): Promise<{
  date: string;
  prices: FuelPriceItem[];
}> {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/toanqng/fuel/main/fuel-vietnam.json"
    );
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      const latest = data[0];
      const prices: FuelPriceItem[] = (latest.list || []).map(
        (item: { name: string; region1: string }) => ({
          name: item.name,
          price: parsePriceString(item.region1),
        })
      );
      return { date: latest.date || "", prices };
    }
  } catch {
    // intentionally empty
  }
  return { date: "", prices: [] };
}

export async function GET() {
  try {
    const { date, prices } = await fetchPVOilPrices();
    const response: FuelPriceResponse = {
      date: date || new Date().toLocaleDateString("vi-VN"),
      prices,
      source: prices.length > 0 ? "PVOIL" : "Không có dữ liệu",
    };
    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { date: "", prices: [], source: "Lỗi" },
      { status: 500 }
    );
  }
}
