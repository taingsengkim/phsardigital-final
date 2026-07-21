import type { ListingAttribute } from "@/lib/types";

type Props = {
  attributes: ListingAttribute[];
};

export default function ProductAttributes({ attributes }: Props) {
  if (!attributes || attributes.length === 0) return null;

  return (
    <section aria-labelledby="specs-heading">
      <h2
        id="specs-heading"
        className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
      >
        Specifications
      </h2>
      <table className="w-full text-sm">
        <tbody>
          {attributes.map((attr) => (
            <tr
              key={attr.id}
              className="border-b last:border-0 even:bg-muted/40"
            >
              <td className="py-2 pr-4 font-medium text-foreground w-1/3">
                {attr.key}
              </td>
              <td className="py-2 text-muted-foreground">{attr.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
