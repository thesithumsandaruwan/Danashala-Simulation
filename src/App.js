import React, { useState, useEffect } from 'react';

const CrowdSimulation = () => {
  const [agents, setAgents] = useState([]);
  const [time, setTime] = useState(0);
  
  const BOX_SIZE = 600;
  const AGENT_RADIUS = 5;
  const TOTAL_AGENTS = 5000;
  const WAIT_TIME = 50;
  const TABLE_HEIGHT = 200;
  const TABLE_WIDTH = 80;

  // Path points remain the same
  const pathPoints = [
    { x: BOX_SIZE, y: 180 },
    { x: BOX_SIZE/2 - TABLE_WIDTH/2 - 147, y: 180 },
    { x: BOX_SIZE/2 - TABLE_WIDTH/2 - 147, y: BOX_SIZE/2 - TABLE_HEIGHT/2 - 140 },
    { x: BOX_SIZE/2 - TABLE_WIDTH/2 - 190, y: BOX_SIZE/2 - TABLE_HEIGHT/2 - 140 },
    { x: BOX_SIZE/2 - TABLE_WIDTH/2 - 190, y: BOX_SIZE/2 + TABLE_HEIGHT/2 - 60 },
    { x: BOX_SIZE/2 - TABLE_WIDTH/2 - 190, y: BOX_SIZE/2 + TABLE_HEIGHT/2 - 60},
    { x: BOX_SIZE/2 - TABLE_WIDTH/2 - 90, y: BOX_SIZE/2 + TABLE_HEIGHT/2 - 60 },
    { x: BOX_SIZE/2 - TABLE_WIDTH/2 - 90, y: BOX_SIZE },
  ];

  // Initialize agents
  useEffect(() => {
    const initialAgents = Array.from({ length: TOTAL_AGENTS }, (_, i) => ({
      id: i,
      x: pathPoints[0].x,
      y: pathPoints[0].y,
      currentPoint: 0,
      speed: 5 + Math.random() * 0.5,
      waiting: false,
      waitTime: 0,
      hasPassedTable: false,
      offset: i * (AGENT_RADIUS * 2.2)
    }));
    setAgents(initialAgents);
  }, []);

  // Animation loop remains the same
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 1);
      setAgents(prevAgents => {
        return prevAgents.map(agent => {
          if (agent.y >= BOX_SIZE) {
            return null;
          }

          if (agent.waiting) {
            if (agent.waitTime >= WAIT_TIME) {
              return {
                ...agent,
                waiting: false,
                waitTime: 0,
                hasPassedTable: true,
                currentPoint: agent.currentPoint + 1
              };
            }
            return {
              ...agent,
              waitTime: agent.waitTime + 16
            };
          }

          const targetPoint = pathPoints[agent.currentPoint + 1];
          if (!targetPoint) return agent;

          const dx = targetPoint.x - agent.x;
          const dy = targetPoint.y - agent.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const isAtDiningPoint = 
            !agent.hasPassedTable &&
            agent.currentPoint === 3 &&
            Math.abs(agent.y - (BOX_SIZE/2)) < TABLE_HEIGHT/2;

          const agentInFront = prevAgents.find(a => 
            a &&
            a.id === agent.id - 1 &&
            Math.sqrt(Math.pow(a.x - agent.x, 2) + Math.pow(a.y - agent.y, 2)) < AGENT_RADIUS * 3
          );

          if (isAtDiningPoint || agentInFront) {
            return {
              ...agent,
              waiting: isAtDiningPoint ? true : agent.waiting
            };
          }

          if (distance < agent.speed) {
            return {
              ...agent,
              x: targetPoint.x,
              y: targetPoint.y,
              currentPoint: agent.currentPoint + 1
            };
          }

          const moveX = (dx / distance) * agent.speed;
          const moveY = (dy / distance) * agent.speed;

          return {
            ...agent,
            x: agent.x + moveX,
            y: agent.y + moveY
          };
        }).filter(agent => agent !== null);
      });
    }, 16);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex items-center justify-center p-4">
      <svg width={BOX_SIZE} height={BOX_SIZE} className="border-2 border-gray-300">
        {/* Background pattern */}
        <defs>
          <pattern id="background-pattern" patternUnits="userSpaceOnUse" width={BOX_SIZE} height={BOX_SIZE}>
            <image 
              href="/images/map.png"
              width={BOX_SIZE} 
              height={BOX_SIZE} 
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>
        </defs>
        
        {/* Background rectangle using the pattern */}
        <rect 
          x="0" 
          y="0" 
          width={BOX_SIZE} 
          height={BOX_SIZE} 
          fill="url(#background-pattern)"
        />
        
        {/* Box outline */}
        <rect 
          x="0" 
          y="0" 
          width={BOX_SIZE} 
          height={BOX_SIZE} 
          fill="none" 
          stroke="black" 
          strokeWidth="2"
        />
        
        
        {/* Path visualization */}
        <path
          d={`M ${pathPoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
          stroke="#ddd"
          strokeWidth="1"
          fill="none"
          opacity="0.5"
        />

        {/* Agents */}
        {agents.map(agent => (
          <circle
            key={agent.id}
            cx={agent.x}
            cy={agent.y}
            r={AGENT_RADIUS}
            fill={agent.waiting ? "#4CAF50" : "#FF0000"}
            opacity={agent.waiting ? 0.8 : 1}
          />
        ))}
      </svg>
    </div>
  );
};

export default CrowdSimulation;