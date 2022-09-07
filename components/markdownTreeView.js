import { useState } from 'react';
import { TreeView } from './TreeView.tsx';
import { POST, SIDEBAR_POST } from "@/constant/project";

const treeViewConverter = (entry) => {
  return entry
    .reduce((acc, e) => {
      let p = e.path.replace('.md', '').split(`${POST}/`)[1];
      if (e.type === 'file') {
        acc = [
          ...acc,
          {
            label: e.matter.title || p.split('/')[p.split('/').length - 1],
            path: [SIDEBAR_POST, ...p.split('/')],
            type: 'file'
          }
        ];

        return acc;
      } else if (e.type === 'folder') {
        let q = p.split('/');
        q.pop();
        const folder = {
          label: q[q.length - 1],
          path: [SIDEBAR_POST, ...q],
          type: 'folder'
        };

        const file = {
          label: e.matter.title || p.split('/')[p.split('/').length - 1],
          path: [SIDEBAR_POST, ...p.split('/')],
          type: 'file'
        }

        return [...acc, file, folder, ...treeViewConverter(e.files)];
      }
    }, [])
    .sort((a, b) => a.path.length - b.path.length);
};

/**
 * Reference:
 *   https://codesandbox.io/s/mw6yv?file=/src/styles.css:302-643
 */
export default function MarkdownTreeView ({
  className,
  allDocsNestedData,
}) {
  console.log("allDocsNestedData:", allDocsNestedData)
  const [selected, setSelected] = useState();
  const formattedTree = [
    {
      label: SIDEBAR_POST,
      path: [SIDEBAR_POST]
    },
    ...treeViewConverter(allDocsNestedData.files)
  ];

  return (
    <div className={className}>
      <TreeView
        data={formattedTree}
        selected={selected}
        onChange={(item) => setSelected(item)}
        nodeRenderer={(item) => (
          <b className="text-xl">{item.label}</b>
        )}
      />
    </div>
  );
};
