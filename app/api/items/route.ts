import { NextRequest, NextResponse } from "next/server";
import { createItem } from "@/lib/supabase/queries";
import { CreateItemInput } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateItemInput;
    const item = await createItem(body);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create item" },
      { status: 500 },
    );
  }
}
