# RAG & Database Synchronization

Skope uses a Retrieval-Augmented Generation (RAG) system to feed verified college information to the Gemini model during diagnostic report generation and counselor chat.

---

## 📂 Data Sources

We merged two local college databases in the `/data` folder:
1.  `Delhi_NCR_Colleges_Database.csv` (General Delhi NCR colleges: government, private, and deemed institutes).
2.  `Delhi_DU_Colleges_Expanded.csv` (Expanded list of Delhi University affiliated colleges).

These CSV databases were deduplicated, verified, and mapped to expand the local RAG knowledge base ([knowledge_base.json](https://github.com/anuragggg2004/Skope/blob/main/data/knowledge_base.json)) to **247 colleges**.

---

## ⚡ Data Synchronization Pipeline

To ensure the local JSON configurations stay in sync with the remote MongoDB Atlas instance, a custom synchronization pipeline executes:

1.  **Deduplication**: College records from CSVs are matched against the local `knowledge_base.json` using case-insensitive clean alphanumeric comparison.
2.  **Tier Mapping**:
    *   `aspirational`: Highly competitive colleges requiring top-tier scores (e.g. IITs, NITs, and top DU colleges like SRCC, St. Stephen's, Hansraj, LSR).
    *   `realistic`: Mid-tier colleges with standard competitive cutoffs.
    *   `safe`: Colleges with flexible admission processes (e.g., evening colleges or distance learning).
3.  **Mongoose Schema Validation**:
    *   The sync script checks each college record against the `College` schema definition inside `/models/College.js`.
    *   Ensures that fields like `type` are mapped to valid schema enums:
        `['IIT', 'NIT', 'IIIT', 'Central University', 'Private', 'Deemed', 'Design', 'Law', 'Management', 'Medical', 'Other']`
        *(Note: All Delhi University colleges are mapped to the `'Central University'` enum type).*
4.  **Upserting**:
    *   Records are upserted into the remote collection using Mongoose's `findOneAndUpdate` with `{ upsert: true }`.

---

## 🌐 Dual-Stack Safe Connection

When running script commands or server connections locally, connection timeouts can occur on dual-stack IPv4/IPv6 networks due to DNS resolution delays.

To resolve this, the database connection configures the connection socket options to explicitly prioritize IPv4:

```javascript
await mongoose.connect(process.env.MONGODB_URI, {
  family: 4 // Forces IPv4 resolution
})
```

This guarantees robust, instant connections to MongoDB Atlas.
