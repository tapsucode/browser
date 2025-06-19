import React from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getStraightPath } from 'reactflow';

interface CustomEdgeData {
  condition?: 'true' | 'false';
}

const CustomEdge: React.FC<EdgeProps<CustomEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
  
  // Define edge color based on condition (if edge is from a condition node)
  let edgeColor = '#64748b'; // Default color
  let labelText = '';
  
  if (data?.condition === 'true') {
    edgeColor = '#4ade80'; // Green for true condition
    labelText = 'True';
  } else if (data?.condition === 'false') {
    edgeColor = '#f87171'; // Red for false condition
    labelText = 'False';
  }

  // Merge provided style with our custom style
  const customStyle = {
    ...style,
    stroke: edgeColor,
    strokeWidth: 2,
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={customStyle}
      />
      
      {/* Only render label if we have condition text */}
      {labelText && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              fontWeight: 500,
              padding: '2px 6px',
              borderRadius: 4,
              backgroundColor: edgeColor,
              color: 'white',
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            {labelText}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CustomEdge;