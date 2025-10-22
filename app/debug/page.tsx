'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useRealtimeEvents, type RealtimeEvent } from '../hooks/useRealtimeEvents';
import { WebSocketStatus } from '../components/status/WebSocketStatus';

export default function DebugPage() {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [maxEvents, setMaxEvents] = useState(100);
  const [filter, setFilter] = useState('');
  const [bufferStats, setBufferStats] = useState<any>(null);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [copiedEvent, setCopiedEvent] = useState<string | null>(null);

  // Connect to SSE stream
  const { isConnected, eventCount, lastEvent, disconnect, reconnect } = useRealtimeEvents({
    onEvent: (event) => {
      if (!isPaused) {
        setEvents((prev) => {
          const newEvents = [event, ...prev];
          // Keep only the last maxEvents
          return newEvents.slice(0, maxEvents);
        });
      }
    },
  });

  // Filter events based on type
  const filteredEvents = filter
    ? events.filter((e) => e.type.toLowerCase().includes(filter.toLowerCase()))
    : events;

  // Clear all events
  const handleClear = () => {
    setEvents([]);
    setExpandedEvents(new Set());
  };

  // Generate unique key for event
  const getEventKey = (event: RealtimeEvent, index: number) => {
    return `${event.timestamp}-${event.type}-${index}`;
  };

  // Toggle event expansion
  const toggleEvent = (eventKey: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eventKey)) {
        next.delete(eventKey);
      } else {
        next.add(eventKey);
      }
      return next;
    });
  };

  // Expand/collapse all events
  const toggleAllEvents = () => {
    if (expandedEvents.size === filteredEvents.length) {
      // All expanded, collapse all
      setExpandedEvents(new Set());
    } else {
      // Some collapsed, expand all
      setExpandedEvents(new Set(filteredEvents.map((event, i) => getEventKey(event, i))));
    }
  };

  // Copy JSON to clipboard
  const copyToClipboard = async (eventKey: string, data: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card from collapsing when clicking copy button
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedEvent(eventKey);
      setTimeout(() => setCopiedEvent(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Export events as JSON
  const handleExport = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `events-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Fetch buffer statistics
  const fetchBufferStats = async () => {
    try {
      const response = await fetch('/api/diagnostics/events?includeEvents=true');
      const data = await response.json();
      setBufferStats(data);
      console.log('=== Event Buffer Diagnostics ===', data);
      return data;
    } catch (error) {
      console.error('Error fetching buffer stats:', error);
      return null;
    }
  };

  // Test SSE connection
  const handleTestConnection = async () => {
    console.log('=== SSE Connection Diagnostic ===');
    console.log('Connection Status:', isConnected ? 'CONNECTED' : 'DISCONNECTED');
    console.log('Event Count:', eventCount);
    console.log('Last Event:', lastEvent);
    console.log('Total Events in Buffer:', events.length);
    console.log('Browser:', navigator.userAgent);
    console.log('EventSource support:', typeof EventSource !== 'undefined' ? 'YES' : 'NO');

    // Fetch buffer stats
    const stats = await fetchBufferStats();

    // Try to fetch the stream endpoint directly
    fetch('/api/stream')
      .then(response => {
        console.log('Fetch /api/stream response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      })
      .catch(error => {
        console.error('Fetch /api/stream error:', error);
      });
  };

  // Format timestamp with milliseconds
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  // Get event color based on type
  const getEventColor = (type: string) => {
    if (type.includes('started')) return 'text-green-600 dark:text-green-400';
    if (type.includes('completed')) return 'text-blue-600 dark:text-blue-400';
    if (type.includes('error')) return 'text-red-600 dark:text-red-400';
    if (type.includes('interrupted')) return 'text-yellow-600 dark:text-yellow-400';
    if (type.includes('message')) return 'text-purple-600 dark:text-purple-400';
    if (type.includes('test')) return 'text-cyan-600 dark:text-cyan-400';
    return 'text-foreground';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background-elevated sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Event Stream Debug</h1>
            </div>
            <div className="flex items-center gap-3">
              <WebSocketStatus status={isConnected ? 'connected' : 'disconnected'} />
              <span className="text-sm text-muted-foreground">
                {eventCount} events received
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="max-w-[1400px] mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant={isPaused ? 'primary' : 'outline'}
              onClick={() => setIsPaused(!isPaused)}
              size="sm"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              size="sm"
            >
              Clear
            </Button>
            <Button
              variant="outline"
              onClick={toggleAllEvents}
              size="sm"
              disabled={filteredEvents.length === 0}
            >
              {expandedEvents.size === filteredEvents.length && filteredEvents.length > 0 ? 'Collapse All' : 'Expand All'}
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              size="sm"
              disabled={events.length === 0}
            >
              Export JSON
            </Button>
            <Button
              variant="outline"
              onClick={isConnected ? disconnect : reconnect}
              size="sm"
            >
              {isConnected ? 'Disconnect' : 'Reconnect'}
            </Button>
            <Button
              variant="outline"
              onClick={handleTestConnection}
              size="sm"
            >
              Test Connection
            </Button>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Filter:</label>
              <input
                type="text"
                placeholder="Type to filter..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 text-sm bg-background text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Max:</label>
              <select
                value={maxEvents}
                onChange={(e) => setMaxEvents(Number(e.target.value))}
                className="px-3 py-1 text-sm bg-background text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
              </select>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">
                Showing {filteredEvents.length} of {events.length} events
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Events List */}
      <main className="max-w-[1400px] mx-auto px-4 pb-8 sm:px-6 lg:px-8">
        {/* Connection Status Info */}
        {!isConnected && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              SSE connection not established. Check the browser console for details. Click &ldquo;Test Connection&rdquo; to diagnose.
            </p>
          </div>
        )}

        {/* Buffer Statistics */}
        {bufferStats && (
          <Card className="mb-4 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Event Buffer Status</h3>
              <button
                onClick={() => setBufferStats(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              <div>
                <div className="text-xs text-muted-foreground">Buffered Events</div>
                <div className="text-lg font-semibold">{bufferStats.stats.bufferedEvents}/{bufferStats.stats.bufferCapacity}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Global Listeners</div>
                <div className="text-lg font-semibold">{bufferStats.stats.globalListeners}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Conversation Listeners</div>
                <div className="text-lg font-semibold">{bufferStats.stats.conversationListeners}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total Listeners</div>
                <div className="text-lg font-semibold">{bufferStats.stats.totalListeners}</div>
              </div>
            </div>
            {bufferStats.bufferedEvents && bufferStats.bufferedEvents.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-2">Recent Buffered Events:</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {bufferStats.bufferedEvents.slice(-10).reverse().map((evt: any, i: number) => (
                    <div key={i} className="text-xs font-mono bg-muted p-2 rounded">
                      <span className={getEventColor(evt.type)}>{evt.type}</span>
                      {evt.conversationId && <span className="text-muted-foreground ml-2">({evt.conversationId.substring(0, 8)}...)</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {isPaused && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Event stream is paused. Click &ldquo;Resume&rdquo; to continue receiving events.
            </p>
          </div>
        )}

        {filteredEvents.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {filter
                ? <>No events match filter &ldquo;{filter}&rdquo;</>
                : 'No events received yet. Events will appear here as they arrive.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-2 w-full">
            {filteredEvents.map((event, index) => {
              const eventKey = getEventKey(event, index);
              const isExpanded = expandedEvents.has(eventKey);
              return (
                <Card
                  key={eventKey}
                  className="w-full transition-all duration-200 hover:shadow-md cursor-pointer text-left"
                  onClick={() => toggleEvent(eventKey)}
                >
                  <div className="p-4 w-full">
                    <div className="flex items-center justify-start gap-4 w-full">
                      {/* Timestamp */}
                      <div className="flex-shrink-0 text-xs text-muted-foreground font-mono min-w-[100px] text-left">
                        {formatTimestamp(event.timestamp)}
                      </div>

                      {/* Event type */}
                      <div className="flex-1 min-w-0 text-left">
                        <span className={`font-semibold text-sm ${getEventColor(event.type)}`}>
                          {event.type}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          #{eventCount - index}
                        </span>
                      </div>

                      {/* Expand/Collapse arrow */}
                      <div className="flex-shrink-0">
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-border w-full text-left">
                        <div className="relative">
                          <button
                            onClick={(e) => copyToClipboard(eventKey, event.data, e)}
                            className="absolute top-2 right-2 px-3 py-1.5 text-xs bg-background hover:bg-muted border border-border rounded transition-colors duration-200 flex items-center gap-1.5 z-10"
                            title="Copy JSON"
                          >
                            {copiedEvent === eventKey ? (
                              <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Copied!
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy
                              </>
                            )}
                          </button>
                          <pre className="text-xs text-left overflow-x-auto bg-muted p-3 pr-20 rounded-lg w-full">
                            {JSON.stringify(event.data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
