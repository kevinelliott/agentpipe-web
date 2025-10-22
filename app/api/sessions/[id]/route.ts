import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

/**
 * GET /api/sessions/[id]
 * Get a single conversation by ID with all messages and participants
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: {
          orderBy: { agentType: 'asc' },
        },
        messages: {
          orderBy: [
            { sequenceNumber: 'asc' },
            { timestamp: 'asc' },
          ],
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: conversation.id,
      name: conversation.name,
      mode: conversation.mode,
      status: conversation.status,
      source: conversation.source,
      startedAt: conversation.startedAt.toISOString(),
      completedAt: conversation.completedAt?.toISOString() || null,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      initialPrompt: conversation.initialPrompt,
      maxTurns: conversation.maxTurns,
      totalMessages: conversation.totalMessages,
      totalTokens: conversation.totalTokens,
      totalCost: conversation.totalCost,
      totalDuration: conversation.totalDuration,
      containerId: conversation.containerId,
      containerStatus: conversation.containerStatus,
      errorMessage: conversation.errorMessage,
      errorStack: conversation.errorStack,
      metadata: conversation.metadata,
      // System information
      agentpipeVersion: conversation.agentpipeVersion,
      systemOS: conversation.systemOS,
      systemOSVersion: conversation.systemOSVersion,
      systemGoVersion: conversation.systemGoVersion,
      systemArchitecture: conversation.systemArchitecture,
      participants: conversation.participants.map((p) => ({
        id: p.id,
        agentId: p.agentId,
        agentType: p.agentType,
        agentName: p.agentName,
        agentVersion: p.agentVersion,
        model: p.model,
        prompt: p.prompt,
        announcement: p.announcement,
        settings: p.settings,
        cliVersion: p.cliVersion,
      })),
      messages: conversation.messages.map((m) => ({
        id: m.id,
        agentId: m.agentId,
        agentName: m.agentName,
        agentType: m.agentType,
        agentVersion: m.agentVersion,
        content: m.content,
        role: m.role,
        timestamp: m.timestamp.toISOString(),
        sequenceNumber: m.sequenceNumber,
        turnNumber: m.turnNumber,
        duration: m.duration,
        inputTokens: m.inputTokens,
        outputTokens: m.outputTokens,
        totalTokens: m.totalTokens,
        model: m.model,
        cost: m.cost,
      })),
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}
