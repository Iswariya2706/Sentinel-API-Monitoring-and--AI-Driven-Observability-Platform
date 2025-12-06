# **Sentinel – API Monitoring & AI-Driven Observability Platform**

**Sentinel** is a fully interactive, high-performance observability platform engineered to monitor microservices, visualize API performance in real-time, and provide **AI-powered debugging insights**.

It simulates a production-grade distributed system environment — **without requiring any backend setup** — making it ideal for demonstrations, hackathons, and technical evaluations.

This project showcases expertise in **full-stack engineering, system design, event simulation, real-time dashboards, TypeScript architecture, and AI integration using Google Gemini**.

---

# 🚀 **Why Sentinel Stands Out**

## 🌟 **1. AI-Powered Observability**
Sentinel features a built-in **AI Debugging Layer** powered by **Google Gemini 2.5 Flash**, capable of:

- Performing root-cause analysis on failed API requests  
- Understanding detailed context (API name, status code, latency patterns)  
- Suggesting actionable fixes and performance optimizations  
- Explaining incidents like a real SRE assistant  

This is not a generic chatbot — it is **domain-specific AI integrated directly into the monitoring workflow**.

---

## 🌟 **2. Fully Local, Real-Time Distributed System Simulation**
Instead of requiring Spring Boot or MongoDB, Sentinel uses a **custom Simulation Engine** that behaves like a production microservices cluster:

- Emits **100% synthetic, realistic API logs every second**  
- Models errors, slow responses, traffic spikes, and rate limits  
- Maintains sliding windows of data for charts & metrics  
- Uses the **Observer Pattern** to push updates instantly across the UI  

No setup. No backend. Just pure functionality — perfect for evaluators.

---

## 🌟 **3. Dual-Mode Developer Workflow (Monitoring + Incident Response)**
Designed the way real engineering teams operate:

- **Monitoring Mode:** Track RPS, latency distribution, error spikes  
- **Incident Mode:** Identify failing requests, assign owners, track resolutions  

Works like a mini **PagerDuty + Grafana + Sentry** combined.

---

## 🌟 **4. Clean, Performant Frontend Architecture (Next.js 14 + TypeScript)**

Sentinel demonstrates modern engineering practices:

- Next.js App Router architecture  
- Strongly typed and modular TypeScript codebase  
- Tailwind-based responsive UI  
- Recharts for smooth, animated real-time data visualizations  
- Component-driven design for scalability and clarity  

This is not just a UI — it’s a **complete observability workflow system**.

---

# 🧠 **Tech Stack**

### **Framework**
- **Next.js 14 (App Router)** — Production-grade React framework

### **Language**
- **TypeScript** — Strongly typed, scalable development

### **Styling**
- **Tailwind CSS** — Utility-first styling

### **Visualization**
- **Recharts** — Real-time charts and visual analytics

### **Icons**
- **Lucide React** — Clean and modern icon set

### 🎯 **AI Integration (Highlight)**
- **Google Gemini API (@google/genai)**  
  Used for intelligent incident analysis, AI-generated recommendations, and context-aware debugging.

---

# 🏗 **Architecture Overview**

Even without a backend, Sentinel behaves like a multi-service production system thanks to a custom **event-driven simulation architecture**.

---

## **1. Real-time Simulation Engine (`services/mockData.ts`)**

A custom-built engine that:

- Generates synthetic API logs every second  
- Models latency spikes, 5xx errors, traffic surges  
- Maintains a sliding window buffer (last 500 logs + last 20 seconds of chart data)  
- Publishes updates using the **Observer Pattern** (real-time dashboard refresh)  

Demonstrates skills in:

- Event-driven systems  
- State management  
- Real-time UX engineering  
- Distributed system simulation  

---

## **2. Issue Management System**

A realistic SRE-style workflow:

- Create & track issues directly from failed logs  
- Assign issues to mock developers (Alice, Bob, Charlie)  
- Manage them using a Kanban-style interface  
- Resolve / escalate issues  

Replicates workflows seen in **Jira, Sentry, OpsGenie**, and SRE teams.

---

## **3. AI Debugging Layer**

Every failed API log can be analyzed using Gemini:

- Automatic context extraction (status, service, latency, payload)  
- Structured RCA prompt engineering  
- Gemini-powered insights  
- Clean explanations inside a dedicated modal  

This is the **signature feature** — production-grade AI integration for real observability use cases.

---

# 📁 **Project Structure**
