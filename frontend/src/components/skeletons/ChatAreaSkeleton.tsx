export function ChatListItemSkeleton() {
  return (
    <div className="flex items-center space-x-3 p-3 mx-2 rounded-xl">
      <div className="w-11 h-11 bg-bg-tertiary animate-pulse rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-bg-tertiary animate-pulse rounded w-3/4" />
        <div className="h-3 bg-bg-tertiary animate-pulse rounded w-1/2" />
      </div>
    </div>
  );
}

export function ChatListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-1 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <ChatListItemSkeleton key={i} />
      ))}
    </div>
  );
}

export function UserMessageSkeleton() {
  return (
    <div className="flex justify-end mb-4">
      <div className="flex items-start space-x-2 max-w-[70%]">
        <div className="bg-primary/10 rounded-2xl rounded-br-md p-3 space-y-2">
          <div className="h-3 bg-bg-tertiary animate-pulse rounded w-32" />
          <div className="h-3 bg-bg-tertiary animate-pulse rounded w-24" />
        </div>
        <div className="w-7 h-7 bg-bg-tertiary animate-pulse rounded-full flex-shrink-0" />
      </div>
    </div>
  );
}

export function AssistantMessageSkeleton() {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start space-x-2 max-w-[70%]">
        <div className="w-7 h-7 bg-bg-tertiary animate-pulse rounded-full flex-shrink-0" />
        <div className="bg-bg-elevated rounded-2xl rounded-bl-md p-3 space-y-2 border border-border">
          <div className="h-3 bg-bg-tertiary animate-pulse rounded w-40" />
          <div className="h-3 bg-bg-tertiary animate-pulse rounded w-36" />
          <div className="h-3 bg-bg-tertiary animate-pulse rounded w-28" />
        </div>
      </div>
    </div>
  );
}

export function MessageListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{i % 2 === 0 ? <UserMessageSkeleton /> : <AssistantMessageSkeleton />}</div>
      ))}
    </div>
  );
}