# Naigos

*Research simulation* · Projects / Autonomy & RL

> Learning to navigate complex three dimensional airspace.

Naigos is a constrained reinforcement learning environment with terrain aware visibility, radar coverage, and threats that move: radar and missile sites, mobile ground units, and interceptor drones. Aircraft learn routes that balance two things pulling in opposite directions: reaching the objective and staying unexposed.

The aircraft is purely evasive. Its whole action space is three flight controls (bank, flight path angle, throttle), so it survives by routing, timing, and terrain masking, never by removing a threat. That rule is enforced in code and by a test, not a comment.

**My part.** Environment mechanics, learning, and evaluation.

**Outcome.** 24.0% → 67.2% objectives reached. Simulation results on 192 held out sorties in one theatre (Owens Valley), against a direct route baseline and a hand written heuristic.

**Stack.** Python, JAX, MAPPO Lagrangian, CesiumJS

## Technical detail and evidence

- After 1,000 MAPPO Lagrangian iterations, shutdowns across the same 192 held out sorties fell from 134 to 25, while mean detection probability fell from 0.268 to 0.224.
- A hand written avoid and wait heuristic is the real bar: the policy edges it on survival (0.677 vs 0.646) but the heuristic still flies quieter.
- It is a single seed, a single theatre, and a single route geometry. The policy mostly wins by climbing above short range engagement ceilings, not by terrain masking, which was the intended mechanic.
- A difficulty curriculum and scripted red behavior make the field progressively harder, and a control barrier function sweep tests safety constraints.
- The simulation’s own elevation model is the physics. A CesiumJS globe draws the same terrain, so aircraft genuinely vanish behind ridges, with line of sight rays shown clear, grazing, or cut. Satellite imagery is cosmetic and never enters an observation.
- More than 1,000 automated tests cover the evasion invariant, line of sight physics, and the environment contract.
- Transfer to real aircraft is a long term goal, not something this project has done.

**Connected to.** Autonomy & learning, Nomos
