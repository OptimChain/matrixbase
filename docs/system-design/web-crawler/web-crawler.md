# Design a Web Crawler | Hello Interview — System Design in a Hurry

> Source: [hellointerview.com/learn/system-design/problem-breakdowns/web-crawler](https://www.hellointerview.com/learn/system-design/problem-breakdowns/web-crawler)

---

## Overview

A web crawler (also known as a spider) is a system that systematically browses the internet, starting from a set of seed URLs, fetching web pages, extracting links, and following them to discover new pages. Web crawlers are the foundation of search engines like Google, Bing, and others. This guide walks through how to design a web crawler at scale, suitable for a system design interview at FAANG-level companies.

---

## Interview Expectations by Level

### E4 (Mid-Level)
An E4 candidate should **understand the high-level data flow and implement a simple system** which can effectively crawl the web. They should be able to discuss politeness and `robots.txt`, with some idea of scaling, though deep knowledge of queueing technologies isn't necessarily expected.

### Senior
The bar is higher. Senior candidates should be able to **discuss the high-level design and then dive into details** of how to handle politeness and adhere to `robots.txt`. They should be able to discuss how to scale the system and efficiently crawl pages within the 5-day time frame. Expectations shift to about **60% breadth and 40% depth**, with the ability to go into technical details in areas of hands-on experience.

### Staff+
The expectation is **a deep dive into the nuances of system design — about 40% breadth and 60% depth** in your understanding. This level is about demonstrating that you have solved enough problems in the real world to confidently design a solution backed by your experience. Great candidates **dive deep into at least 3+ key areas**, showcasing not just proficiency but also innovative thinking and optimal solution-finding abilities.

---

## 1. Requirements

### Functional Requirements

1. **Crawl the full web** starting from a set of seed URLs.
2. **Extract text data** from websites and store them (e.g., in a database or blob storage).
3. **Discover new URLs** by extracting links from crawled pages and adding them to the crawl frontier.

### Non-Functional Requirements

1. **Fault Tolerance** — The system must handle failures gracefully so that crawling can resume without losing progress.
2. **Politeness** — Adhere to `robots.txt` so as not to overload website servers. Websites define how often they can be crawled, and the crawler should avoid effectively DDoS-ing a site by hitting it repeatedly.
3. **Efficiency** — Crawl the entire web (approximately 10 billion pages) within a 5-day time frame.
4. **Scalability** — Scale to handle 10B pages across distributed infrastructure.

### Back-of-the-Envelope Estimation

- **Total pages:** ~10 billion
- **Time frame:** 5 days = 432,000 seconds
- **Pages per second:** ~23,000 pages/sec
- **Average page size:** ~100 KB
- **Bandwidth:** ~2.3 GB/s

---

## 2. Core Entities

| Entity | Description |
|--------|-------------|
| **URL** | The address of a web page to be crawled |
| **Web Page** | The HTML content fetched from a URL |
| **Extracted Text** | The text content extracted from the HTML |
| **Extracted URLs** | New URLs found in the HTML to add to the frontier |
| **Metadata** | Information about the crawl (timestamp, depth, status, content hash) |

---

## 3. High-Level Design

The high-level design focuses on getting a simple system up and running that satisfies the core functional requirements. Improvements come in the deep dive section.

### Data Flow

```
Seed URLs → Frontier Queue → Crawler → DNS Resolution → Fetch HTML → Parse HTML → Extract URLs → Store Data → Repeat
```

### Key Components

#### Frontier Queue
The queue of URLs to be crawled. The system starts with a set of **seed URLs** and adds new URLs as it crawls the web. Technology options include **Kafka**, **Redis**, or **SQS**, with the specific choice deferred to deep dive.

#### Crawler Service
Fetches web pages, extracts text data, and extracts new URLs to add to the frontier queue. The guide discusses how to scale this component to handle 10B pages.

#### DNS Resolver
Resolves domain names to IP addresses so the crawler can fetch web pages. Discussions include caching DNS lookups, handling DNS failures, and ensuring DNS servers are not overloaded.

#### Metadata DB
Stores metadata about crawled URLs (status, timestamp, depth, content hash). Used for deduplication and tracking crawl progress.

#### Blob Storage (S3)
Where extracted text data and raw HTML are stored. S3 is chosen because it is highly scalable and durable, designed to store large amounts of data cheaply. Alternatives include Google Cloud Storage or Azure Blob Storage.

### High-Level Architecture Diagram

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Seed URLs   │────▶│  Frontier Queue  │────▶│  Crawler Service │
└─────────────┘     │  (Kafka/SQS)     │     │                  │
                    └─────────────────┘     └────────┬─────────┘
                           ▲                         │
                           │                         ▼
                    ┌──────┴────────┐        ┌──────────────┐
                    │  New URLs     │        │  DNS Resolver │
                    │  (extracted)  │        └──────┬───────┘
                    └───────────────┘               │
                                                    ▼
                                            ┌──────────────┐
                                            │  Fetch HTML   │
                                            │  (HTTP GET)   │
                                            └──────┬───────┘
                                                   │
                                    ┌──────────────┴──────────────┐
                                    ▼                             ▼
                            ┌──────────────┐             ┌──────────────┐
                            │  Extract     │             │  Extract     │
                            │  Text Data   │             │  URLs        │
                            └──────┬───────┘             └──────┬───────┘
                                   │                            │
                                   ▼                            │
                            ┌──────────────┐                    │
                            │  Blob Storage │                   │
                            │  (S3)         │                   │
                            └──────────────┘                    │
                                                                │
                                   ┌────────────────────────────┘
                                   ▼
                            ┌──────────────┐
                            │  Metadata DB │
                            │  (Dedup      │
                            │   Check)     │
                            └──────┬───────┘
                                   │
                                   ▼
                            ┌──────────────┐
                            │ Frontier     │
                            │ Queue        │
                            │ (add new)    │
                            └──────────────┘
```

---

## 4. Deep Dives

### Deep Dive 1: Pipelined Crawler Stages

For data processing questions, **the first thought should be to break the system into smaller, pipelined stages**. Pipelining allows you to isolate failures to a single stage and retry that stage without losing progress on the rest of the data.

#### Stage 1: URL Fetcher
- Fetches the HTML of the web page from the external server.
- If there is a failure, the fetch can be retried without losing progress on the rest of the data.
- **Raw HTML is stored in blob storage** for later processing.

#### Stage 2: Text & URL Extraction
- Extracts text data from the HTML.
- Extracts any linked URLs to add to the frontier queue.
- Although there's an argument for separating text and URL extraction, these tasks are **simple enough to combine into a single stage**.

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────────────┐
│  Frontier    │────▶│  URL Fetcher     │────▶│  Text & URL Extraction   │
│  Queue       │     │  (Stage 1)       │     │  (Stage 2)               │
└──────────────┘     │                  │     │                          │
                     │  • Fetch HTML    │     │  • Parse HTML            │
                     │  • Store in S3   │     │  • Extract text → S3     │
                     │  • Retry on fail │     │  • Extract URLs → Queue  │
                     └──────────────────┘     └──────────────────────────┘
```

**Rationale:** Pipelining allows isolating failures to a single stage and retrying without losing progress. If the fetch fails, you retry the fetch. If text extraction fails, you still have the raw HTML in S3 and can reprocess it.

---

### Deep Dive 2: Politeness & robots.txt

Politeness refers to being respectful with the resources of the websites we are crawling. This involves:

- Ensuring that crawling activity **does not disrupt the normal function of the site** by overloading its servers.
- **Respecting the website's bandwidth.**
- **Adhering to any specific restrictions or rules** set by the site administrators.

#### robots.txt

`robots.txt` is a file that websites use to communicate with web crawlers. It tells crawlers:
- Which pages they are **allowed** to crawl.
- Which pages they are **not allowed** to crawl.
- **How frequently** they can crawl the site.

Example `robots.txt`:
```
User-agent: *
Disallow: /private/
Disallow: /admin/
Crawl-delay: 10

User-agent: Googlebot
Allow: /
Crawl-delay: 5
```

#### Crawl-Delay Directive

The `Crawl-delay` directive is an extension of the protocol and can be used to provide a hint for the desired crawling delay, given in **seconds a crawler should wait between two requests**. The `Crawl-delay` directive is not declared in the majority of cases, but if it is given, it should be respected.

#### Implementation: Domain-Based Rate Limiting

To implement politeness at scale:
1. **Use consistent hashing** to assign domains to specific crawler instances.
2. Each crawler instance maintains a **per-domain rate limiter**.
3. URLs from the same domain always end up on the **same queue** (via consistent hashing based on the hostname's hash).
4. A single crawler process is responsible for **throttling requests and respecting robots.txt rules** for any single domain, without need for cross-crawler state synchronization.

```
                    ┌──────────────────────────────┐
                    │       Consistent Hashing      │
                    │    (hostname → crawler ID)     │
                    └──────────┬───────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
     ┌────────────┐   ┌────────────┐   ┌────────────┐
     │ Crawler 1  │   │ Crawler 2  │   │ Crawler 3  │
     │            │   │            │   │            │
     │ Domains:   │   │ Domains:   │   │ Domains:   │
     │ A, D, G    │   │ B, E, H    │   │ C, F, I    │
     │            │   │            │   │            │
     │ Rate Limit │   │ Rate Limit │   │ Rate Limit │
     │ per domain │   │ per domain │   │ per domain │
     └────────────┘   └────────────┘   └────────────┘
```

---

### Deep Dive 3: URL Deduplication

You can first check if a URL has already been crawled by checking the **Metadata DB** before putting it on the queue. If the URL already exists in the URL table, skip it. This is the first line of defense: **URL-level deduplication**.

But URL-level dedup isn't enough. Different URLs can serve identical content:
- `http://example.com` and `http://www.example.com` might return the same page.
- Totally different domains can have exactly the same content.

For these cases, you need **content-level deduplication**.

---

### Deep Dive 4: Content Deduplication

Hash the page content after fetching it and compare that hash to what's been seen before. If the exact content has already been stored, skip the expensive parsing step.

#### Option A: Hash in Metadata DB
Store a content hash (e.g., SHA-256) in the URL table in the Metadata DB. Before processing a new page, check if any existing entry has the same content hash.

#### Option B: Bloom Filter

A **Bloom filter** is a probabilistic data structure that allows testing whether an element is a member of a set:
- It can tell **definitively** if an element is *not* in the set.
- It can only tell **probabilistically** if an element *is* in the set (small chance of false positive).

This is perfect for the dedup use case:
1. Store hashes of content already crawled in the Bloom filter.
2. When you fetch a new URL, hash the content and check the Bloom filter.
3. If the hash is **not** in the filter → definitely new, process it.
4. If the hash **is** in the filter → probably already crawled, skip it.

**Technology:** Use **Redis** with the **RedisBloom** module (part of Redis Stack):
- `BF.ADD` to add a hash.
- `BF.EXISTS` to check membership.

> **Author's honest take:** "To be honest, I think the bloom filter here is a bit overkill. It's a cool data structure, and it's fun to talk about in an interview, but I think the index approach is more practical. It's simpler, and modern DB indexes are quite efficient." It's noted as a solution primarily because candidates always bring it up.

#### Option C: Simhash (Near-Duplicate Detection)

For detecting **near-duplicates** (not just exact matches), **Simhash** is a locality-sensitive hashing technique:
1. **Tokenize** the document into features (e.g., words, n-grams).
2. **Weight** features (e.g., by term frequency).
3. **Hash** each feature into a fixed-size binary vector.
4. **Compute a weighted sum** for each bit position.
5. **Generate the final fingerprint** based on the sign of each weighted sum.

The **Hamming distance** between two Simhash fingerprints measures similarity. A small Hamming distance indicates the documents are likely near-duplicates.

```
Document A: "The quick brown fox"
Document B: "The quick brown dog"

Simhash A: 10110010...  (64-bit)
Simhash B: 10110011...  (64-bit)
                   ^
           Hamming distance = 1 → Near duplicate!
```

---

### Deep Dive 5: Crawler Traps & Depth Limiting

**Crawler traps** are pages designed to keep crawlers on the site indefinitely. They can be created by:
- A page that links to itself many times.
- A page that links to many other dynamically generated pages.
- Infinite URL patterns (e.g., calendar pages that go infinitely into the future).

#### Solution: Max Depth

Add a **depth field** to URL metadata, incremented each time a new link is followed. If the depth exceeds a threshold (e.g., **15-20**), crawling stops for that path.

```
Seed URL (depth=0)
   └── Page A (depth=1)
          └── Page B (depth=2)
                 └── Page C (depth=3)
                        └── ...
                               └── Page N (depth=20) ← STOP
```

---

### Deep Dive 6: Scaling with Consistent Hashing

**Consistent hashing** solves the problem of data redistribution when adding or removing an instance in a distributed system. The key insight is to arrange both data and databases in a circular space, often called a **"hash ring."**

#### In the context of web crawling:
- Use consistent hashing to **distribute URLs among crawler instances** based on domain.
- A new crawler server can be **added or removed** without reshuffling all assignments.
- **Virtual nodes** prevent structural imbalance (uneven key distribution).
- **Replication and key salting** prevent workload imbalance (uneven traffic).

```
                     Hash Ring
                    ┌────────┐
               ─────│ Node A │─────
              │     └────────┘     │
         ┌────────┐           ┌────────┐
         │ Node D │           │ Node B │
         └────────┘           └────────┘
              │     ┌────────┐     │
               ─────│ Node C │─────
                    └────────┘

  URLs hashed to positions on the ring:
  example.com  → Node A
  google.com   → Node B
  github.com   → Node C
  reddit.com   → Node D
```

---

### Deep Dive 7: Priority Crawling

Not all URLs are equally important. To implement priority crawling:

- Use **multiple SQS queues** with different priorities and have crawlers poll the high-priority queue first.
- With Kafka, use **separate topics per priority level**.
- Priority can be based on:
  - **Domain authority** (popular domains first).
  - **Page freshness** (recently updated pages).
  - **Depth** (prefer shallow pages).

---

### Deep Dive 8: Handling Dynamic Content

Many modern websites use JavaScript frameworks (React, Angular, Vue) where content is loaded dynamically. A simple HTTP GET won't capture the rendered content.

**Solution:** Use a **headless browser** like **Puppeteer** or **Playwright** to render the page and extract content. This is more expensive computationally but necessary for JavaScript-heavy sites.

---

## 5. Complete Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           WEB CRAWLER SYSTEM                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌───────────┐                                                              │
│   │ Seed URLs │─────┐                                                        │
│   └───────────┘     │                                                        │
│                     ▼                                                        │
│   ┌─────────────────────────────────────┐                                    │
│   │         FRONTIER QUEUE              │                                    │
│   │    (Kafka / SQS - Prioritized)      │◀──────────────────────────┐        │
│   │                                     │                           │        │
│   │  ┌──────────┐ ┌──────────┐ ┌─────┐ │                           │        │
│   │  │ Priority │ │ Priority │ │ ... │ │                           │        │
│   │  │  High    │ │  Low     │ │     │ │                           │        │
│   │  └──────────┘ └──────────┘ └─────┘ │                           │        │
│   └──────────────────┬──────────────────┘                           │        │
│                      │                                              │        │
│                      ▼                                              │        │
│   ┌──────────────────────────────────────────┐                      │        │
│   │      CONSISTENT HASHING (by domain)       │                      │        │
│   └──────┬──────────┬──────────┬─────────────┘                      │        │
│          ▼          ▼          ▼                                     │        │
│   ┌──────────┐┌──────────┐┌──────────┐                              │        │
│   │Crawler 1 ││Crawler 2 ││Crawler N │                              │        │
│   │          ││          ││          │                              │        │
│   │ Rate     ││ Rate     ││ Rate     │                              │        │
│   │ Limiter  ││ Limiter  ││ Limiter  │                              │        │
│   │ (per     ││ (per     ││ (per     │                              │        │
│   │  domain) ││  domain) ││  domain) │                              │        │
│   └────┬─────┘└────┬─────┘└────┬─────┘                              │        │
│        │           │           │                                    │        │
│        └───────────┼───────────┘                                    │        │
│                    ▼                                                │        │
│   ┌────────────────────────────────┐                                │        │
│   │   PIPELINE STAGE 1:            │     ┌──────────────┐           │        │
│   │   URL Fetcher                  │────▶│  DNS Cache   │           │        │
│   │                                │     └──────────────┘           │        │
│   │   • Check robots.txt          │                                │        │
│   │   • Fetch HTML (HTTP GET)      │     ┌──────────────┐           │        │
│   │   • Store raw HTML in S3       │────▶│  Blob Storage│           │        │
│   │   • Retry on failure           │     │  (S3)        │           │        │
│   └────────────────┬───────────────┘     └──────────────┘           │        │
│                    │                                                │        │
│                    ▼                                                │        │
│   ┌────────────────────────────────┐                                │        │
│   │   PIPELINE STAGE 2:            │                                │        │
│   │   Text & URL Extraction        │                                │        │
│   │                                │     ┌──────────────┐           │        │
│   │   • Parse HTML                 │────▶│  Blob Storage│           │        │
│   │   • Extract text → store       │     │  (S3 - text) │           │        │
│   │   • Extract URLs               │     └──────────────┘           │        │
│   └────────────────┬───────────────┘                                │        │
│                    │                                                │        │
│                    ▼                                                │        │
│   ┌────────────────────────────────┐                                │        │
│   │   DEDUPLICATION                │                                │        │
│   │                                │     ┌──────────────┐           │        │
│   │   • URL dedup (Metadata DB)    │◀───▶│  Metadata DB │           │        │
│   │   • Content dedup (hash/bloom) │     │  (Postgres)  │           │        │
│   │   • Depth check (max ~20)      │     └──────────────┘           │        │
│   │                                │                                │        │
│   │   ┌─────────────┐             │     ┌──────────────┐           │        │
│   │   │ Bloom Filter│             │◀───▶│  Redis       │           │        │
│   │   │ (optional)  │             │     │  (RedisBloom)│           │        │
│   │   └─────────────┘             │     └──────────────┘           │        │
│   └────────────────┬───────────────┘                                │        │
│                    │                                                │        │
│                    │  New unique URLs                                │        │
│                    └────────────────────────────────────────────────┘        │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Technology Choices Summary

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Frontier Queue** | Kafka / SQS | Distributed, durable, supports partitioning |
| **Blob Storage** | Amazon S3 | Highly scalable, durable, cheap for large data |
| **Metadata DB** | PostgreSQL | Relational, supports indexing for dedup |
| **DNS Cache** | Local cache / Redis | Avoid redundant DNS lookups |
| **Bloom Filter** | Redis (RedisBloom) | Fast probabilistic dedup |
| **Crawler** | Distributed workers | Horizontally scalable |
| **Headless Browser** | Puppeteer / Playwright | For JavaScript-rendered pages |
| **Hashing** | Consistent Hashing | Distribute domains across crawlers |

---

## 7. Key Interview Talking Points

### What to Emphasize
1. **Pipelining** — Break the crawler into stages for fault isolation and retry.
2. **Politeness** — `robots.txt`, `Crawl-delay`, per-domain rate limiting.
3. **Deduplication** — URL-level + content-level (hash, Bloom filter, Simhash).
4. **Scaling** — Consistent hashing for domain distribution, horizontal scaling.
5. **Fault Tolerance** — Retry at each pipeline stage, checkpointing, idempotency.
6. **Crawler Traps** — Max depth limiting.

### Common Follow-Up Questions
- How would you handle dynamically generated content (SPAs)?
- How do you prioritize which URLs to crawl first?
- How do you handle URL normalization (removing query params, trailing slashes)?
- What happens if a crawler node goes down?
- How would you re-crawl pages to keep data fresh?

---

## 8. Additional Resources

- [Hello Interview — Web Crawler Problem Breakdown](https://www.hellointerview.com/learn/system-design/problem-breakdowns/web-crawler)
- [Hello Interview — Web Crawler Answer Key](https://www.hellointerview.com/learn/system-design/answer-keys/web-crawler)
- [Hello Interview — Consistent Hashing Deep Dive](https://www.hellointerview.com/learn/system-design/deep-dives/consistent-hashing)
- [Hello Interview — System Design Delivery Framework](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery)
- [Hello Interview — Kafka Deep Dive](https://www.hellointerview.com/learn/system-design/deep-dives/kafka)

---

*Note: This document was compiled from publicly available search snippets and metadata from the Hello Interview web crawler system design guide. The original page at hellointerview.com may contain additional content, interactive elements, and embedded diagrams not captured here. Images from the original page could not be directly downloaded due to network access restrictions.*
