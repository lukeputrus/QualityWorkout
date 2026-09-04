// Nothing is exposed to the renderer today - the UI talks to BillBuddy
// entirely over the same local HTTP API a paired phone uses (fetch calls
// to /api/...), so no privileged Node bridge is needed for v1. This file
// is kept as the place to add one later (e.g. native "Save PDF As...").
