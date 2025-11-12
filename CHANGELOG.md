# Changelog

## Unreleased

### Breaking Changes

- **Removed `toggle` function to keep all operations idempotent**
  - Use `add()` to add a reaction (automatically replaces any existing reaction)
  - Use `remove()` to remove a specific reaction
  - In React apps, implement toggle behavior by checking `userReactions` and
    calling either `add()` or `remove()`

- **Users can now only have one reaction per target+namespace**
  - When a user adds a new reaction, any existing reaction on that
    target+namespace is automatically removed
  - Aggregate counts are updated automatically (old reaction decremented, new
    reaction incremented)
  - This makes the component ideal for single-choice reactions, voting, and
    rating systems
  - If you need multiple reactions per user, use different namespaces

### New Features

- Added optional `namespace` parameter to all functions
  - Allows multiple independent reaction systems on the same target
  - Users can only react once per `targetId + namespace` combination
  - Backwards compatible (namespace defaults to `undefined`)

## 0.1.0

- Initial release of the Reactions component
- Support for adding, removing, and toggling reactions
- Denormalized reaction counts for fast aggregation
- Query methods to get reactions by target and user
- Idempotent operations (safe to call multiple times)
- React hook for easy integration with React apps
- Full TypeScript support with type-safe APIs
- Comprehensive test suite
