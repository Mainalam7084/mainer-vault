import { AddItemForm } from "@/components/forms/add-item-form";
import { AppShell } from "@/components/layout/app-shell";

export default function AddPage() {
  return (
    <AppShell title="Add New Item">
      <AddItemForm />
    </AppShell>
  );
}
