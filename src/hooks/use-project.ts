'use client';

import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import * as React from 'react';

interface Project {
  blocks: string[]
}

const projectAtom = atomWithStorage<Project>('project', {
  blocks: [],
});

export function useProject() {
  const [isAdded, setIsAdded] = React.useState(false);
  const [project, setProject] = useAtom(projectAtom);

  const addBlock = React.useCallback(
    (block: string) => {
      setProject((prev) => {
        if (prev.blocks.includes(block)) {
          return prev;
        }
        return { ...prev, blocks: [...prev.blocks, block] };
      })
      setIsAdded(true);

      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    },
    [setProject],
  );

  const removeBlock = React.useCallback(
    (block: string) => {
      setProject(prev => ({
        ...prev,
        blocks: prev.blocks.filter(b => b !== block),
      }));
    },
    [setProject],
  );

  const hasBlock = React.useCallback(
    (block: string) => {
      return project.blocks.includes(block);
    },
    [project],
  );

  const resetProject = React.useCallback(() => {
    setProject({ blocks: [] });
  }, [setProject]);

  return { addBlock, hasBlock, isAdded, project, removeBlock, resetProject };
}
