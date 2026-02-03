# IBM Storage Scale 4.4

## Purpose of This Site

This site is the **interactive learning front-end** for the IBM Storage Scale Basic Administration for Linux and AIX (H005G ERC 4.4) course. It is designed to complement instructor-led delivery with:

* Clear daily learning flow
* Visual architecture explanations
* Embedded labs, checkpoints, and recovery guidance
* Navigation that mirrors how administrators *actually think and troubleshoot*

This is not a marketing page. It is a **working learning environment**.

---

# Landing Page (index.html)

## Hero Section

**IBM Storage Scale 4.4**
*Basic Administration for Linux and AIX*

> Build, operate, and recover Storage Scale clusters with confidence.

**Duration:** 3 Days
**Level:** Intermediate (UNIX/Linux, SAN fundamentals required)

[ Start Day 1 ]  [ View Lab Architecture ]

---

## What You Will Learn

* How IBM Storage Scale actually works under the hood (GPFS architecture)
* How clusters form, survive failures, and prevent split-brain
* How to install, license, and validate a working cluster
* How NSDs, quorum, pagepool, and descriptors interact

This course prioritizes **operational truth over slides**.

---

## Course Structure

### Day 1 – Foundations & Installation

* Storage Scale architecture and terminology
* Node preparation and prerequisites
* Installation flow and cluster creation

### Day 2 – Cluster Management

* Node roles, quorum, fencing
* File systems, NSDs, performance tuning

### Day 3 – ILM & High Availability

* Storage pools and filesets
* Replication, snapshots, and recovery

---

## Lab Philosophy

> Split-brain is worse than downtime.

Labs are designed to:

* Fail safely
* Teach recovery, not just success paths
* Match real-world production mistakes

---

# Day 1 – Foundations & Installation (day1/index.html)

## Day 1 Learning Objectives

By the end of Day 1, learners will be able to:

* Explain Storage Scale architecture and components
* Identify correct node roles and cluster models
* Prepare Linux nodes correctly for installation
* Install Storage Scale and create a functional cluster

---

## Day 1 Agenda

| Time  | Topic                                        |
| ----- | -------------------------------------------- |
| 00:30 | Welcome & Course Orientation                 |
| 01:15 | Unit 1: Storage Scale Overview               |
| 01:00 | Lab 1: Cluster Node Preparation              |
| 01:30 | Unit 2: Installation & Cluster Configuration |

---

## Unit 1 – IBM Storage Scale Overview

### What Storage Scale Is

IBM Storage Scale (formerly GPFS) is a **distributed, clustered file system** designed to provide:

* Parallel I/O from many nodes
* No single metadata server bottleneck
* Strong consistency with POSIX semantics

> Storage Scale is *not* NAS. It is a **parallel file system**.

---

### Core Components (Interactive Diagram Placeholder)

* Client nodes
* NSD servers
* Disks / failure groups
* Cluster manager
* File system manager

[ Diagram: Parallel I/O flow client → NSD servers → disks ]

---

### Key Concepts Callouts

**NSD (Network Shared Disk)**
A protocol abstraction, not just a disk.

**Quorum**
Protects *integrity*, not availability.

**Pagepool**
Storage Scale’s own memory cache — not the OS page cache.

---

## Lab 1 – Cluster Node Preparation

### Goal

Prepare Linux nodes so Storage Scale can safely install and operate.

### You Will:

* Verify OS and kernel versions
* Install required RPMs
* Validate network and time sync
* Confirm disk visibility

---

### Lab Checkpoint – Node Readiness

Before continuing, every node must:

* Resolve all cluster hostnames
* Share consistent time (NTP)
* See intended storage devices
* Have matching kernel-devel packages

> ⚠️ Most installation failures start *here*, not during rpm install.

---

## Unit 2 – Installation & Cluster Configuration

### Installation Flow (Concept First)

1. Install prerequisites
2. Extract Storage Scale installer
3. Install GPFS RPMs
4. Build portability layer
5. Create cluster
6. Start Storage Scale

Each step modifies **cluster-wide state**.

---

### Command Walkthrough (Example)

```bash
# Run on all nodes
./Storage_Scale_Data_Management-5.x.x.x-x86_64-Linux-install --text-only
```

What this actually does:

* Extracts licensed RPMs
* Prepares kernel interfaces
* Stages binaries under /usr/lpp/mmfs

---

### Cluster Creation

```bash
mmcrcluster -N nodefile.txt -p manager-node -s secondary-node
```

This command:

* Defines trust boundaries
* Establishes quorum rules
* Writes cluster metadata

> ⚠️ This is not reversible without teardown.

---

## End of Day 1 – Reality Check

By now, learners should:

* Have a running Storage Scale cluster
* Understand *why* quorum exists
* Know where cluster state is stored

If a node disappears tomorrow, you know what to check first.

---

## Navigation

[ ← Landing Page ]  [ Day 2 → ]

