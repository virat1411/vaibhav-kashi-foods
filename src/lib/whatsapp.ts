export function whatsappOrderUrl(input: {
  phone: string;
  restaurant: string;
  customerName: string;
  items: { name: string; quantity: number }[];
  address: string;
  total: string;
}) {
  const lines = [
    `Order for ${input.restaurant}`,
    `Name: ${input.customerName}`,
    "",
    "Items:",
    ...input.items.map((item) => `• ${item.name} x ${item.quantity}`),
    "",
    `Address: ${input.address}`,
    `Total: ${input.total}`,
  ];
  return `https://wa.me/${input.phone.replace(/\D/g, "")}?text=${encodeURIComponent(lines.join("\n"))}`;
}
