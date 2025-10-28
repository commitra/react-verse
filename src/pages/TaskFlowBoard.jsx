/**
 * TASK FLOW BOARD DASHBOARD TODOs
 * --------------------------------
 * Easy:
 *  - [ ] Add color picker for node customization
 *  - [ ] Add keyboard shortcuts (Delete to remove, Ctrl+Z for undo)
 *  - [x] Export/Import board as JSON file
 *  - [ ] Add node icons based on task type
 *  - [ ] Improve mobile touch support
 * Medium:
 *  - [ ] Implement task search/filter functionality
 *  - [ ] Add task categories/tags system
 *  - [ ] Implement drag-to-connect nodes (auto-create edges)
 *  - [ ] Add task due dates and reminders
 *  - [ ] Create template boards (Kanban, Sprint Planning, etc.)
 *  - [ ] Add collaborative features (share board state via URL)
 * Advanced:
 *  - [ ] Implement real-time sync with backend (WebSocket)
 *  - [ ] Add animation for node transitions
 *  - [ ] Implement smart auto-layout algorithms
 *  - [ ] Add task dependencies validation (prevent circular deps)
 *  - [ ] Create analytics dashboard (task completion rates)
 *  - [ ] Add version history / board snapshots
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Card from '../components/Card.jsx';
import HeroSection from '../components/HeroSection.jsx';

// Simple Modal Component for Task Form
const TaskModal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg)',
          padding: '24px',
          borderRadius: '12px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

// Custom node component for tasks
const TaskNode = ({ data }) => {
  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
  };

  const statusColors = {
    todo: '#6b7280',
    'in-progress': '#3b82f6',
    completed: '#10b981',
    blocked: '#ef4444',
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        background: 'var(--bg)',
        border: `2px solid ${priorityColors[data.priority] || '#d0d0d0'}`,
        minWidth: '200px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{data.label}</strong>
        <button
          onClick={data.onDelete}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0 4px',
          }}
          title="Delete task"
        >
          ×
        </button>
      </div>
      {data.description && (
        <p style={{ fontSize: '12px', color: 'var(--text)', opacity: 0.8, margin: '4px 0' }}>
          {data.description}
        </p>
      )}
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: '10px',
            padding: '2px 8px',
            borderRadius: '12px',
            background: statusColors[data.status],
            color: 'white',
            fontWeight: '600',
          }}
        >
          {data.status}
        </span>
        <span
          style={{
            fontSize: '10px',
            padding: '2px 8px',
            borderRadius: '12px',
            background: priorityColors[data.priority],
            color: 'white',
            fontWeight: '600',
          }}
        >
          {data.priority}
        </span>
      </div>
      <button
        onClick={data.onEdit}
        style={{
          marginTop: '8px',
          width: '100%',
          padding: '4px',
          fontSize: '11px',
          cursor: 'pointer',
          background: 'var(--primary)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        Edit
      </button>
    </div>
  );
};

const nodeTypes = {
  taskNode: TaskNode,
};

const STORAGE_KEY = 'taskflow-board-state';

const stripHandlers = (nodeList = []) =>
  nodeList.map(({ data = {}, ...rest }) => {
    const { onEdit, onDelete, ...restData } = data;
    return {
      ...rest,
      data: { ...restData },
    };
  });

const applyHandlers = (nodeList = [], onEdit, onDelete) =>
  nodeList.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onEdit: () => onEdit(node.id),
      onDelete: () => onDelete(node.id),
    },
  }));

export default function TaskFlowBoard() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    description: '',
    status: 'todo',
    priority: 'medium',
  });
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const nodeIdCounter = useRef(1);
  const nodesRef = useRef([]);
  const handleDeleteNodeRef = useRef(() => {});

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      ),
    [setEdges]
  );

  const handleAddTask = () => {
    setEditingNode(null);
    setFormData({
      label: '',
      description: '',
      status: 'todo',
      priority: 'medium',
    });
    setIsModalOpen(true);
  };

  const handleEditNode = useCallback((nodeId) => {
    const node = nodesRef.current.find((n) => n.id === nodeId);
    if (node) {
      setEditingNode(nodeId);
      setFormData({
        label: node.data.label,
        description: node.data.description || '',
        status: node.data.status,
        priority: node.data.priority,
      });
      setIsModalOpen(true);
    }
  }, []);

  const hydrateNodes = useCallback(
    (nodeList = []) => applyHandlers(stripHandlers(nodeList), handleEditNode, (id) => handleDeleteNodeRef.current(id)),
    [handleEditNode]
  );

  const handleDeleteNode = useCallback(
    (nodeId) => {
      setNodes((nds) => hydrateNodes(nds.filter((node) => node.id !== nodeId)));
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    },
    [hydrateNodes, setEdges, setNodes]
  );

  handleDeleteNodeRef.current = handleDeleteNode;

  const addInitialNodes = useCallback(() => {
    const baseNodes = [
      {
        id: '1',
        type: 'taskNode',
        position: { x: 250, y: 100 },
        data: {
          label: 'Project Planning',
          description: 'Define project scope and requirements',
          status: 'completed',
          priority: 'high',
        },
      },
      {
        id: '2',
        type: 'taskNode',
        position: { x: 250, y: 250 },
        data: {
          label: 'Design UI/UX',
          description: 'Create wireframes and mockups',
          status: 'in-progress',
          priority: 'high',
        },
      },
      {
        id: '3',
        type: 'taskNode',
        position: { x: 500, y: 250 },
        data: {
          label: 'Backend Development',
          description: 'Set up API endpoints',
          status: 'todo',
          priority: 'medium',
        },
      },
    ];

    const initialEdges = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'smoothstep',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: 'e1-3',
        source: '1',
        target: '3',
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
      },
    ];

    setNodes(hydrateNodes(baseNodes));
    setEdges(initialEdges);
    nodeIdCounter.current = 4;
  }, [hydrateNodes, setEdges, setNodes]);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const { nodes: savedNodes, edges: savedEdges, counter } = JSON.parse(savedState);
        setNodes(hydrateNodes(savedNodes || []));
        setEdges(savedEdges || []);
        nodeIdCounter.current = counter || (savedNodes?.length || 1);
      } else {
        addInitialNodes();
      }
    } catch (error) {
      console.error('Failed to load board state:', error);
      addInitialNodes();
    }
  }, [addInitialNodes, hydrateNodes, setEdges, setNodes]);

  useEffect(() => {
    if (nodes.length === 0 && edges.length === 0) return;
    const state = {
      nodes: stripHandlers(nodes),
      edges,
      counter: nodeIdCounter.current,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [nodes, edges]);

  const handleSaveTask = () => {
    if (!formData.label.trim()) {
      alert('Task title is required!');
      return;
    }

    if (editingNode) {
      // Update existing node
      setNodes((nds) =>
        hydrateNodes(
          nds.map((node) =>
            node.id === editingNode
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    label: formData.label,
                    description: formData.description,
                    status: formData.status,
                    priority: formData.priority,
                  },
                }
              : node
          )
        )
      );
    } else {
      // Add new node
      const newId = `${nodeIdCounter.current}`;
      const newNode = {
        id: newId,
        type: 'taskNode',
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 300 + 100,
        },
        data: {
          label: formData.label,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
        },
      };
      nodeIdCounter.current += 1;
      setNodes((nds) => hydrateNodes([...nds, newNode]));
    }

    setIsModalOpen(false);
    setFormData({
      label: '',
      description: '',
      status: 'todo',
      priority: 'medium',
    });
  };

  const handleClearBoard = () => {
    if (window.confirm('Are you sure you want to clear the entire board? This cannot be undone.')) {
      setNodes([]);
      setEdges([]);
      nodeIdCounter.current = 1;
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleExportBoard = () => {
    const state = {
      nodes: stripHandlers(nodes),
      edges,
      counter: nodeIdCounter.current,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `taskflow-board-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBoard = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result);
        if (imported.nodes && imported.edges) {
          setNodes(hydrateNodes(imported.nodes));
          setEdges(imported.edges);
          nodeIdCounter.current = imported.counter || imported.nodes.length + 1;
          alert('Board imported successfully!');
        } else {
          alert('Invalid board file format!');
        }
      } catch (error) {
        alert('Failed to import board: ' + error.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <HeroSection
        title={
          <>
            Task Flow <span style={{ color: 'var(--primary)' }}>Board</span>
          </>
        }
        subtitle="Visualize and manage your tasks with a dynamic node-based workflow"
      />

      <div style={{ padding: '0 1rem 1rem 1rem' }}>
        <Card
          title="📋 Visual Task Management"
          footer={
            <div style={{ fontSize: '12px', color: 'var(--text)', opacity: 0.7 }}>
              Drag nodes to reposition • Connect nodes to show dependencies • Double-click background to add tasks
            </div>
          }
        >
          <p style={{ marginBottom: '1rem' }}>
            Create a Trello-style board with draggable task nodes. Connect tasks to visualize dependencies and
            workflow. Your board is automatically saved to browser storage.
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <button onClick={handleAddTask} style={{ padding: '8px 16px', cursor: 'pointer' }}>
              ➕ Add Task
            </button>
            <button onClick={handleClearBoard} style={{ padding: '8px 16px', cursor: 'pointer' }}>
              🗑️ Clear Board
            </button>
            <button onClick={handleExportBoard} style={{ padding: '8px 16px', cursor: 'pointer' }}>
              💾 Export Board
            </button>
            <label
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                background: 'var(--primary)',
                color: 'white',
                borderRadius: '4px',
                display: 'inline-block',
              }}
            >
              📂 Import Board
              <input
                type="file"
                accept="application/json"
                onChange={handleImportBoard}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div style={{ fontSize: '14px', marginBottom: '1rem', color: 'var(--text)' }}>
            <strong>Tasks: {nodes.length}</strong> | <strong>Connections: {edges.length}</strong>
          </div>
        </Card>
      </div>

      <div ref={reactFlowWrapper} style={{ flexGrow: 1, height: '600px', border: '2px solid var(--border)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          onPaneDoubleClick={(event) => {
            if (reactFlowInstance) {
              const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
              });
              const newId = `${nodeIdCounter.current}`;
              const newNode = {
                id: newId,
                type: 'taskNode',
                position,
                data: {
                  label: `Task ${newId}`,
                  description: '',
                  status: 'todo',
                  priority: 'medium',
                },
              };
              nodeIdCounter.current += 1;
              setNodes((nds) => hydrateNodes([...nds, newNode]));
            }
          }}
        >
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const priorityColors = {
                low: '#10b981',
                medium: '#f59e0b',
                high: '#ef4444',
              };
              return priorityColors[node.data?.priority] || '#6b7280';
            }}
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
          <Background variant="dots" gap={12} size={1} />
          <Panel position="top-right">
            <div
              style={{
                background: 'var(--bg)',
                padding: '8px',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div>
                <strong>Legend:</strong>
              </div>
              <div style={{ marginTop: '4px' }}>
                🟢 Low Priority | 🟠 Medium | 🔴 High
              </div>
              <div style={{ marginTop: '4px' }}>
                <span style={{ color: '#6b7280' }}>◆</span> To Do |{' '}
                <span style={{ color: '#3b82f6' }}>◆</span> In Progress |{' '}
                <span style={{ color: '#10b981' }}>◆</span> Complete
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {isModalOpen && (
        <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h3>{editingNode ? 'Edit Task' : 'Add New Task'}</h3>
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              <strong>Task Title *</strong>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Enter task title..."
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: '8px' }}>
              <strong>Description</strong>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description..."
                rows={3}
                style={{ width: '100%', padding: '8px', marginTop: '4px', resize: 'vertical' }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: '8px' }}>
              <strong>Status</strong>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </label>

            <label style={{ display: 'block', marginBottom: '16px' }}>
              <strong>Priority</strong>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px' }}>
                Cancel
              </button>
              <button
                onClick={handleSaveTask}
                style={{
                  padding: '8px 16px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                }}
              >
                {editingNode ? 'Update Task' : 'Add Task'}
              </button>
            </div>
          </div>
        </TaskModal>
      )}
    </div>
  );
}
