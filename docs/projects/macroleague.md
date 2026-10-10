# MacroLeague

*Working app / Expo and Supabase* · Projects / Games & products

> Nutrition tracking with a little friendly competition.

A campus first mobile app that pairs meal logging with leagues, challenges, and rewards, so tracking feels less like bookkeeping. You score your day against your own goals and climb a leaderboard of people you actually know.

The database, not the client, owns every number that matters. XP, points, streaks, and standings are computed server side, so the leaderboard can’t be gamed from the app.

**My part.** Mobile product and interface development.

**Outcome.** Onboarding · logging · challenges · rewards. A working app with no public adoption numbers yet. Partnerships with grocery chains are conversations, not agreements.

**Stack.** React Native, Expo, NativeWind, Supabase

**Workflow.** Onboarding → Meal logging → Challenges → Rewards

## Technical detail and evidence

- Rewards are bounded on purpose: points reward consistency, with hard caps on volume, so grinding meal logs isn’t a strategy.
- Meals are entered in plain language, resolved against USDA FoodData Central and Open Food Facts, and shown as an editable draft. Nothing is saved until you confirm.
- Redemption issues a server generated code built for a real cashier, with an alphabet that avoids look alike characters.
- Dining halls for seven New Jersey schools are built in, with Rutgers as the anchor campus.

**Connected to.** Volleyball, PALURA, Autumn design builds
