export function LoadingScreen({ text }: { text: string }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vw",
        backgroundColor: "rbga(0,0,0,0.6)",
      }}
    >
      {text}
    </div>
  );
}
