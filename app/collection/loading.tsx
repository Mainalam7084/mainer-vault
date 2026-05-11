export default function CollectionLoading() {
  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-6 h-14 animate-pulse rounded-vault border-[3px] border-vault-border bg-vault-soft" />
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <article
            key={index}
            className="h-72 animate-pulse rounded-vault border-[3px] border-vault-border bg-vault-soft"
          />
        ))}
      </section>
    </main>
  );
}
