import { createClient } from "@/lib/supabase/client";

export async function uploadImage(file: File): Promise<string> {
  const supabase = createClient();
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `items/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("items").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("items").getPublicUrl(path);
  return data.publicUrl;
}
