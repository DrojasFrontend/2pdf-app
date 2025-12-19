export default function ProjectSkeleton() {
  return (
    <div className="template-card">
      <div className="template-header">
        <div className="template-title">
          {/* Icon skeleton */}
          <div
            className="skeleton-pulse"
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '4px',
            }}
          />
          {/* Name skeleton */}
          <div
            className="skeleton-pulse"
            style={{
              height: '20px',
              width: '180px',
              borderRadius: '4px',
            }}
          />
        </div>
        <div className="template-actions">
          {/* More button skeleton */}
          <div
            className="skeleton-pulse"
            style={{
              width: '40px',
              height: '32px',
              borderRadius: '6px',
            }}
          />
        </div>
      </div>
      <div className="template-details">
        {/* Description skeleton */}
        <div
          className="skeleton-pulse"
          style={{
            height: '14px',
            width: '250px',
            borderRadius: '4px',
            marginBottom: '8px',
          }}
        />
        {/* Slug skeleton */}
        <div
          className="skeleton-pulse"
          style={{
            height: '16px',
            width: '200px',
            borderRadius: '4px',
          }}
        />
      </div>
      
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
            #f3f4f6 0%,
            #e5e7eb 50%,
            #f3f4f6 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
}

