import Link from 'next/link';
import classNames from 'classnames';
import { Plus, Minus } from '@/components/icons/basic';
import { BaseItem, getKey, useTreeView } from '@/hooks/useTreeView';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export type TreeItem = BaseItem & {
  label: string;
  type: string;
};

const popLast = (arr: any) => {
  let result = arr;
  result.pop();

  return result
}


export const TreeView = ({
  data,
  selected,
  onChange,
  nodeRenderer
}: {
  data: TreeItem[];
  selected: TreeItem | undefined;
  onChange: (item: TreeItem) => void;
  nodeRenderer?: (item: TreeItem) => JSX.Element;
}) => {
  const router = useRouter();
  const {
    sortedItems,
    getRootProps,
    getItemProps,
    isGroupItem,
    isCollapsedItem,
    isHiddenItem,
    toggleItem,
    focusedItem,
    setCollapsedItems
  } = useTreeView<TreeItem>({
    items: data,
    selected,
    sortCallback: (a, b) => {
      return a.label.localeCompare(b.label);
    },
    onSelectedItemChange: (item) => {
      onChange(item);
    }
  });

  // with router
  useEffect(() => {
    // home page
    if (router.asPath === '/note') {
      toggleItem(sortedItems[0]);
      return;
    }
    // prepare an array which needs to collapse
    const needCollapsed = sortedItems
      .filter((item) => item.type === 'folder')
      .filter(
        (item) =>
          item.path.join('/') !==
          popLast(router.asPath.split('/')).slice(1).join('/')
      );
    // collapse an array
    setCollapsedItems(needCollapsed)
    // remain select status
  }, [router.isReady]);

  return (
    <div className="tree-view" {...getRootProps()}>
      <style jsx>{`
        .toggle {
          cursor: pointer;
          font-size: 10px;
          padding-right: 8px;
        }

        .tree-view-item {
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
        }
      `}</style>
      {sortedItems.map((item) => {
        return (
          <div
            key={getKey(item)}
            className={classNames(
              'flex',
              'tree-view-item',
              focusedItem === item && 'focused-item',
              isCollapsedItem(item) && 'collapsed-item',
              isHiddenItem(item) && 'hidden',
              router.asPath.replace("%20", " ") === `/${getKey(item)}` &&
                'bg-black text-white'
            )}
            style={{ paddingLeft: 16 * item.path.length }}
            {...getItemProps(item)}
          >
            {isGroupItem(item) && (
              <span className="toggle mr-2" onClick={() => toggleItem(item)}>
                {isCollapsedItem(item) ? <Plus /> : <Minus />}
              </span>
            )}
            {nodeRenderer ? (
              isGroupItem(item) ? (
                <span onClick={() => toggleItem(item)}>
                  {nodeRenderer(item)}
                </span>
              ) : (
                <Link href={`/${getKey(item)}`}>
                  <div className="ml-7">{nodeRenderer(item)}</div>
                </Link>
              )
            ) : (
              <span>{item.label}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
