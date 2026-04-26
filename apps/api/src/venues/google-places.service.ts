import { Injectable, Logger } from "@nestjs/common";

export type PlaceSuggestion = {
  placeId: string;
  primaryText: string;
  secondaryText: string;
};

type AutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      place?: string;
      placeId?: string;
      text?: { text?: string };
      structuredFormat?: {
        mainText?: { text?: string };
        secondaryText?: { text?: string };
      };
    };
  }>;
};

type PlaceDetailsResponse = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
};

@Injectable()
export class GooglePlacesService {
  private readonly logger = new Logger(GooglePlacesService.name);

  private get apiKey(): string | undefined {
    const k = process.env.GOOGLE_PLACES_API_KEY?.trim();
    return k && k.length > 0 ? k : undefined;
  }

  isEnabled(): boolean {
    return this.apiKey !== undefined;
  }

  async suggest(input: string): Promise<PlaceSuggestion[]> {
    const key = this.apiKey;
    const q = input.trim();
    if (!key || q.length < 2) {
      return [];
    }
    try {
      const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key,
        },
        body: JSON.stringify({ input: q }),
      });
      const raw = (await res.json()) as AutocompleteResponse & { error?: { message?: string } };
      if (!res.ok) {
        this.logger.warn(
          `Places autocomplete failed: ${res.status} ${raw?.error?.message ?? ""}`,
        );
        return [];
      }
      const out: PlaceSuggestion[] = [];
      for (const s of raw.suggestions ?? []) {
        const p = s.placePrediction;
        if (!p) {
          continue;
        }
        const placeId =
          p.placeId ??
          (typeof p.place === "string" ? p.place.replace(/^places\//, "") : undefined);
        if (!placeId) {
          continue;
        }
        const primary =
          p.structuredFormat?.mainText?.text ?? p.text?.text ?? placeId;
        const secondary = p.structuredFormat?.secondaryText?.text ?? "";
        out.push({ placeId, primaryText: primary, secondaryText: secondary });
      }
      return out;
    } catch (e) {
      this.logger.warn(`Places autocomplete error: ${String(e)}`);
      return [];
    }
  }

  async fetchPlaceById(placeId: string): Promise<{
    placeId: string;
    name: string;
    locality: string | null;
  } | null> {
    const key = this.apiKey;
    if (!key) {
      return null;
    }
    const name = placeId.startsWith("places/") ? placeId : `places/${placeId}`;
    const url = `https://places.googleapis.com/v1/${encodeURIComponent(name)}`;
    try {
      const res = await fetch(url, {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": "id,displayName,formattedAddress",
        },
      });
      const raw = (await res.json()) as PlaceDetailsResponse & { error?: { message?: string } };
      if (!res.ok) {
        this.logger.warn(
          `Place details failed: ${res.status} ${raw?.error?.message ?? JSON.stringify(raw)}`,
        );
        return null;
      }
      const id = raw.id?.replace(/^places\//, "") ?? placeId.replace(/^places\//, "");
      const nameText = raw.displayName?.text ?? id;
      const locality = raw.formattedAddress?.trim() ?? null;
      return {
        placeId: id,
        name: nameText,
        locality,
      };
    } catch (e) {
      this.logger.warn(`Place details error: ${String(e)}`);
      return null;
    }
  }
}
