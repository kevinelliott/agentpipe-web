import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { formatAsJSON, formatAsCSV, formatAsMarkdown, getMimeType, getFileExtension } from '@/app/lib/exportFormatters';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const format = (request.nextUrl.searchParams.get('format') || 'json') as 'json' | 'csv' | 'markdown';

    // Validate format
    if (!['json', 'csv', 'markdown'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be json, csv, or markdown' },
        { status: 400 }
      );
    }

    // Fetch conversation with all related data
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
          select: {
            id: true,
            agentId: true,
            agentName: true,
            agentType: true,
            content: true,
            timestamp: true,
            model: true,
            inputTokens: true,
            outputTokens: true,
            totalTokens: true,
            cost: true,
            duration: true,
          },
        },
        participants: {
          select: {
            agentName: true,
            agentType: true,
            model: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Map data to export format
    const exportData = {
      id: conversation.id,
      title: conversation.name,
      status: conversation.status,
      source: conversation.source,
      createdAt: conversation.createdAt.toISOString(),
      completedAt: conversation.completedAt?.toISOString() || null,
      totalMessages: conversation.totalMessages,
      totalTokens: conversation.totalTokens,
      totalCost: conversation.totalCost,
      totalDuration: conversation.totalDuration,
      messages: conversation.messages.map((msg) => ({
        agentName: msg.agentName,
        agentType: msg.agentType,
        content: msg.content,
        timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : msg.timestamp.toISOString(),
        model: msg.model,
        inputTokens: msg.inputTokens,
        outputTokens: msg.outputTokens,
        totalTokens: msg.totalTokens,
        cost: msg.cost,
        duration: msg.duration,
      })),
      participants: conversation.participants,
      summaryText: conversation.summaryText,
    };

    // Format data based on requested format
    let formattedData: string;
    switch (format) {
      case 'json':
        formattedData = formatAsJSON(exportData);
        break;
      case 'csv':
        formattedData = formatAsCSV(exportData);
        break;
      case 'markdown':
        formattedData = formatAsMarkdown(exportData);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid format' },
          { status: 400 }
        );
    }

    // Return file with appropriate content type
    const mimeType = getMimeType(format);
    const extension = getFileExtension(format);
    const fileName = `conversation-${conversation.id}-${new Date().toISOString().split('T')[0]}.${extension}`;

    return new NextResponse(formattedData, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error exporting conversation:', error);
    return NextResponse.json(
      { error: 'Failed to export conversation' },
      { status: 500 }
    );
  }
}
