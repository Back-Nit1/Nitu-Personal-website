# Nomos

*Simulation / Team project* · Projects / Autonomy & RL

> What if vehicles could coordinate without traffic lights?

Nomos is a multiagent reinforcement learning environment built on San Francisco’s real road network, pulled from OpenStreetMap. Every vehicle runs the same shared driving policy, and that policy has to learn coordination: who yields, who goes, how to merge.

Safety isn’t left to the reward alone. Constraints and a barrier function filter shape how vehicles are allowed to interact while the policy learns.

**My part.** Built with a team of four.

**Outcome.** 24 training agents → 6,000+ evaluation agents. Simulation results. This has not been deployed on real vehicles.

**Recognition.** Top 4 finalist · YC × HUD RL Environments Hackathon

**Stack.** Python, JAX, MAPPO, MuJoCo, OSMnx

## Technical detail and evidence

- The environment is a vectorized JAX kinematic bicycle model. Cars follow routes planned on the real street graph, observe their nearest neighbors, and respawn onto fresh routes when they finish, so throughput of completed trips is the headline metric.
- Training is centralized and execution is decentralized: one shared actor, a centralized critic that sees a pooled summary of the scene, and every car acting on its own observations.
- Safety mechanisms include PPO Lagrangian constraints, a proximity shaping penalty, and control barrier functions as a last resort backstop.
- Most early crashes turned out to be simulator artifacts: frozen crashed cars became obstacles, the collision radius was wider than a lane, and respawns landed on other cars. Fixing those, plus offsetting each car into its own lane so opposing traffic stops aiming down one centerline, did more than reward tuning.
- Within the simulation evaluation, collisions per vehicle dropped roughly 10× and traffic rule compliance rose from 89% to 95%.
- Visualization and compute also drew on deck.gl, CesiumJS, Modal, and Fireworks.

## Links

- [Hackathon project page](https://www.aivalley.io/hackathons/hud-frontier-rsi-rl-environments-hackathon/projects/3b03a168-b363-460f-b062-c596177fce8a)

**Connected to.** Autonomy & learning, Volleyball, Why the Greek names?, Naigos, Campus preparedness
