import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  allowBooleanAttributes: true,
  processEntities: false, // XXE protection
  trimValues: true,
});

export function parseXmlSafe<T = unknown>(xml: string): T {
  // Strip DOCTYPE and external entity declarations as extra protection
  const sanitized = xml
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<!ENTITY[^>]*>/gi, "");
  return parser.parse(sanitized) as T;
}

export function extractTextContent(node: unknown): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node || typeof node !== "object") return "";
  if (Array.isArray(node)) return node.map(extractTextContent).join(" ");
  const obj = node as Record<string, unknown>;
  if ("#text" in obj) return String(obj["#text"]);
  return Object.values(obj).map(extractTextContent).join(" ").trim();
}
