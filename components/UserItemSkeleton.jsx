export default function UserItemSkeleton() {
  return (
    <div
      style={{
        backgroundColor: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        {/* Avatar skeleton - círculo */}
        <div
          className="skeleton-pulse"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
          }}
        />
        
        {/* Text skeleton - dos líneas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {/* Primera línea - nombre */}
          <div
            className="skeleton-pulse"
            style={{
              height: '16px',
              width: '140px',
              borderRadius: '4px',
            }}
          />
          {/* Segunda línea - estado */}
          <div
            className="skeleton-pulse"
            style={{
              height: '14px',
              width: '100px',
              borderRadius: '4px',
            }}
          />
        </div>
      </div>
      
      {/* Badge skeleton */}
      <div
        className="skeleton-pulse"
        style={{
          width: '60px',
          height: '28px',
          borderRadius: '6px',
        }}
      />
      
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        
        .skeleton-pulse {
          background: linear-gradient(
            90deg,
            #21262d 0%,
            #30363d 50%,
            #21262d 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
}

