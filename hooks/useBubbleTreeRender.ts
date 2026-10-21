'use client'

import * as d3 from 'd3'
import { RefObject, useEffect } from 'react'

import { GraphLink, GraphNode } from '@/utils/bubbleGraph'
import { createBubbleTreeRenderer } from '@/utils/bubbleTreeRenderer'

interface UseBubbleTreeRenderOptions {
  svgRef: RefObject<SVGSVGElement | null>
  containerRef: RefObject<HTMLDivElement | null>
  zoomRef: RefObject<d3.ZoomBehavior<SVGSVGElement, unknown> | null>
  nodes: GraphNode[]
  links: GraphLink[]
  isFullscreen: boolean
  onZoomLevelChange: (level: number) => void
  onSelectionChange: () => void
  onNodeClick: (nodeId: string) => void
  onRenderError: (error: Error) => void
}

export function useBubbleTreeRender({
  svgRef,
  containerRef,
  zoomRef,
  nodes,
  links,
  isFullscreen,
  onZoomLevelChange,
  onSelectionChange,
  onNodeClick,
  onRenderError
}: UseBubbleTreeRenderOptions) {
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return

    let teardown: (() => void) | null = null
    try {
      teardown = createBubbleTreeRenderer({
        svgRef,
        containerRef,
        zoomRef,
        nodes,
        links,
        onZoomLevelChange,
        onSelectionChange,
        onNodeClick
      })
    } catch (err) {
      console.error('D3 rendering error:', err)
      const errorToDisplay =
        err instanceof Error ? err : new Error('Unknown error')
      requestAnimationFrame(() => onRenderError(errorToDisplay))
    }

    return () => {
      teardown?.()
    }
  }, [
    isFullscreen,
    nodes,
    links,
    svgRef,
    containerRef,
    zoomRef,
    onZoomLevelChange,
    onSelectionChange,
    onNodeClick,
    onRenderError
  ])
}
