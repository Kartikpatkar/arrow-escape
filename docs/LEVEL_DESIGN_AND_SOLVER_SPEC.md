# Arrow Escape — Level Design & Solver Specification

## 1. Level Data Format Specification (JSON Schema)

Every level in Arrow Escape is declared as a validated JSON object conforming to the following TypeScript interface:

```typescript
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface ArrowConfig {
  id: string;        // Unique identifier (e.g., 'a1', 'arrow-0-1')
  x: number;         // 0-indexed column coordinate [0 .. width - 1]
  y: number;         // 0-indexed row coordinate [0 .. height - 1]
  direction: Direction;
  colorVariant?: string; // Optional custom color/accent
}

export interface LevelData {
  id: number;                // Level index (1, 2, 3...)
  packId: string;            // 'core', 'daily', 'master'
  title: string;             // Display name (e.g., 'First Flight')
  width: number;             // Grid width (columns, e.g., 3 to 8)
  height: number;            // Grid height (rows, e.g., 3 to 8)
  arrows: ArrowConfig[];     // Initial array of arrows
  authorNotes?: string;      // Internal designer notes
  metrics?: {
    minMoves: number;        // Equal to arrows.length
    optimalSolutions: number;// Number of valid permutation escape paths
    maxBranchingFactor: number; // Max candidate choices at any step
    difficultyScore: number; // Computed metric 1.0 - 10.0
  };
}
```

### Example: Level 1 (Tutorial)
```json
{
  "id": 1,
  "packId": "core",
  "title": "Clear Skies",
  "width": 3,
  "height": 3,
  "arrows": [
    { "id": "a1", "x": 1, "y": 0, "direction": "UP" },
    { "id": "a2", "x": 1, "y": 1, "direction": "UP" }
  ]
}
```

---

## 2. Solver & Validator Algorithm

A puzzle is valid if and only if **at least one valid sequence of moves clears every single arrow**.

### 2.1 Backtracking Solver Implementation
```typescript
interface SolverResult {
  isSolvable: boolean;
  solutionPaths: string[][]; // Lists of arrow IDs in escaping order
  minSteps: number;
  branchingFactors: number[];
  deadEndsEncountered: number;
}

export function solvePuzzle(level: LevelData, findFirstOnly = false): SolverResult {
  const solutions: string[][] = [];
  const branchingFactors: number[] = [];
  let deadEnds = 0;

  function backtrack(remainingArrows: ArrowConfig[], currentPath: string[]): void {
    if (remainingArrows.length === 0) {
      solutions.push([...currentPath]);
      return;
    }

    // Find all arrows that currently have an unobstructed escape path
    const validMoves = remainingArrows.filter(arrow =>
      isEscapePathClear(arrow, remainingArrows, level.width, level.height)
    );

    branchingFactors.push(validMoves.length);

    if (validMoves.length === 0) {
      deadEnds++;
      return; // Dead end reached; board cannot be cleared from this branch
    }

    for (const move of validMoves) {
      const nextRemaining = remainingArrows.filter(a => a.id !== move.id);
      currentPath.push(move.id);

      backtrack(nextRemaining, currentPath);

      currentPath.pop();
      if (findFirstOnly && solutions.length > 0) return;
    }
  }

  backtrack(level.arrows, []);

  return {
    isSolvable: solutions.length > 0,
    solutionPaths: solutions,
    minSteps: level.arrows.length,
    branchingFactors,
    deadEndsEncountered: deadEnds,
  };
}
```

---

## 3. Difficulty Scoring Metric ($D$)

Puzzle difficulty is determined using four mathematical components:

$$D = w_1 \cdot \text{BoardDensity} + w_2 \cdot \text{DependencyDepth} + w_3 \cdot \frac{1}{\text{AvgBranching}} + w_4 \cdot \text{DeadEndPenalty}$$

1. **Board Density ($\rho$):** $\frac{\text{ArrowCount}}{W \times H}$. Higher density creates visual complexity and tighter corridors.
2. **Dependency Depth ($L$):** The length of the longest dependency chain $A_1 \to A_2 \to \dots \to A_k$ where $A_i$ blocks $A_{i+1}$.
3. **Average Branching Factor ($\bar{b}$):** Average number of unblocked arrows available at any decision point. Puzzles with $\bar{b} \approx 1$ are strict linear bottlenecks; high $\bar{b}$ offers relaxed freedom.
4. **Dead-End Rate ($R_{\text{dead}}$):** Probability that a random valid tap leads to an unsolvable state later.

---

## 4. Initial 30-Level Progression Blueprint

| Tier | Levels | Grid Size | Arrow Count | Mechanics Introduced | Target Time |
|---|---|---|---|---|---|
| **Tier 1: Tutorial** | 1–5 | $3 \times 3$ to $4 \times 4$ | 2–5 | Direct paths, single dependencies, basic UP/DOWN/LEFT/RIGHT | 5–15 sec |
| **Tier 2: Beginner** | 6–12 | $4 \times 4$ to $5 \times 5$ | 6–10 | Cross-axis blocking (horizontal blocked by vertical), dual escapes | 15–30 sec |
| **Tier 3: Intermediate** | 13–18 | $5 \times 5$ | 10–15 | Cascading chain reactions, circular dependency traps | 30–60 sec |
| **Tier 4: Advanced** | 19–24 | $6 \times 6$ | 16–22 | High density grid, decoy arrows, strict bottleneck sequences | 60–90 sec |
| **Tier 5: Expert** | 25–30 | $6 \times 6$ to $7 \times 7$ | 22–30 | Tight interlocking matrices, subtle corner escapes | 90–150 sec |

---

## 5. Procedural Level Generator (For Daily Escape)

For the Daily Challenge generator:
1. **Reverse-Play Construction (Guaranteed Solvability):**
   - Start with an empty grid $W \times H$.
   - Select an edge coordinate and place an arrow facing outwards.
   - Retract back into the grid: place an arrow facing inward along the previous arrow's reverse vector, creating a deliberate blocking relationship.
   - Repeat $N$ times until target density is reached.
2. **Forward Verification:** Run the `solvePuzzle` validator. Ensure the puzzle has at least one unique, non-trivial solution path and $D \ge 5.0$.
3. **Deterministic Seeding:** Seed using the calendar date string `YYYY-MM-DD` so that every player across the globe experiences the exact same puzzle on any given calendar day without a cloud database.
