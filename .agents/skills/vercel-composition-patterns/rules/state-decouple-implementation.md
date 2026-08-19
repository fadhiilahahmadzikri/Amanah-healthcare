---
title: Decouple State Management from UI
impact: MEDIUM
impactDescription: enables swapping state implementations without changing UI
tags: composition, state, architecture
---

## Decouple State Management from UI

The provider component should be the only place that knows how state is managed.
UI components consume the context interface—they don't know if state comes from
useState, Zustand, or a server sync.

**Incorrect (UI coupled to state implementation):**

```tsx
function ChannelComposer({ channelId }: { channelId: string }) {

  const state = useGlobalChannelState(channelId);
  const { submit, updateInput } = useChannelSync(channelId);

  return (
    <Composer.Frame>
      <Composer.Input value={state.input} onChange={(text) => sync.updateInput(text)} />
      <Composer.Submit onPress={() => sync.submit()} />
    </Composer.Frame>
  );
}
```

**Correct (state management isolated in provider):**

```tsx

function ChannelProvider({
  channelId,
  children
}: {
  channelId: string;
  children: React.ReactNode;
}) {
  const { state, update, submit } = useGlobalChannel(channelId);
  const inputRef = useRef(null);

  return (
    <Composer.Provider state={state} actions={{ update, submit }} meta={{ inputRef }}>
      {children}
    </Composer.Provider>
  );
}

function ChannelComposer() {
  return (
    <Composer.Frame>
      <Composer.Header />
      <Composer.Input />
      <Composer.Footer>
        <Composer.Submit />
      </Composer.Footer>
    </Composer.Frame>
  );
}

function Channel({ channelId }: { channelId: string }) {
  return (
    <ChannelProvider channelId={channelId}>
      <ChannelComposer />
    </ChannelProvider>
  );
}
```

**Different providers, same UI:**

```tsx

function ForwardMessageProvider({ children }) {
  const [state, setState] = useState(initialState);
  const forwardMessage = useForwardMessage();

  return (
    <Composer.Provider state={state} actions={{ update: setState, submit: forwardMessage }}>
      {children}
    </Composer.Provider>
  );
}

function ChannelProvider({ channelId, children }) {
  const { state, update, submit } = useGlobalChannel(channelId);

  return (
    <Composer.Provider state={state} actions={{ update, submit }}>
      {children}
    </Composer.Provider>
  );
}
```

The same `Composer.Input` component works with both providers because it only
depends on the context interface, not the implementation.
