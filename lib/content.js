// lib/content.js
//
// Static knowledge-base content for the Learn tab. Kept as plain data so a
// non-technical maintainer can edit this file (or later move it into a CMS)
// without touching any application logic.

export const RIGHTS_TOPICS = [
  {
    slug: "fundamental-rights",
    title: "Fundamental Rights",
    summary: "What the Constitution guarantees you",
    body: "Fundamental Rights protect basic freedoms such as equality, expression, movement, and protection against exploitation. They can be enforced directly in court if violated.",
  },
  {
    slug: "consumer-rights",
    title: "Consumer Rights",
    summary: "Refunds, warranties, complaints",
    body: "As a consumer you have the right to safety, information, choice, and redress. If a product or service fails you, you can file a complaint with the consumer forum in your district.",
  },
  {
    slug: "womens-rights",
    title: "Women's Rights",
    summary: "Workplace, safety, legal protection",
    body: "Legal protections cover equal pay, protection from workplace harassment, maternity benefits, and safety at home and in public spaces, with dedicated helplines for urgent support.",
  },
  {
    slug: "child-rights",
    title: "Child Rights",
    summary: "Protection, education, welfare",
    body: "Every child has a right to free education, protection from abuse and exploitation, and access to health and welfare services, backed by dedicated child-protection authorities.",
  },
  {
    slug: "citizen-charter",
    title: "Citizen Charter",
    summary: "Service timelines by department",
    body: "Citizen Charters set out the service standards, timelines, and escalation process each government department commits to, so you know what to expect and when to escalate.",
  },
  {
    slug: "government-schemes",
    title: "Government Schemes",
    summary: "Find schemes you're eligible for",
    body: "A wide range of welfare and development schemes exist across income levels, age groups, and occupations. Check eligibility carefully before applying, and apply only through official channels.",
  },
];

export function getRightsTopic(slug) {
  return RIGHTS_TOPICS.find((t) => t.slug === slug) || null;
}
