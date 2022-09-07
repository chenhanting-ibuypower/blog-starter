import { useEffect, useMemo, useRef, useState } from 'react';

export type BaseItem = {
  path: string[];
};

const pathToKey = (path: string[]): string => path.join('/');
export const getKey = <Item extends BaseItem>(item: Item): string =>
  pathToKey(item.path);
const getItemByKey = <Item extends BaseItem>(items: Item[], key: string) =>
  items.find((item) => getKey(item) === key);

const isParentPath = (parentPath: string[], childPath: string[]): boolean => {
  if (parentPath.length === childPath.length) {
    return false;
  }

  if (childPath.length === 0) {
    return false;
  }

  if (parentPath.length === 0) {
    return true;
  }

  if (parentPath[0] !== childPath[0]) {
    return false;
  }

  return isParentPath(parentPath.slice(1), childPath.slice(1));
};

const isParentItem = <Item extends BaseItem>(
  parent: Item,
  child: Item
): boolean => {
  return isParentPath(parent.path, child.path);
};

const isChildItem = <Item extends BaseItem>(
  child: Item,
  parent: Item
): boolean => {
  return isParentPath(parent.path, child.path);
};

export const filterItemsKeepingParents = <Item extends BaseItem>(
  items: Item[],
  filterCallback: (item: Item) => boolean
): Item[] => {
  const matchingItems = items.filter(filterCallback);
  return items.filter((item) => {
    return !!matchingItems.find((matchingItem) => {
      return matchingItem === item || isParentItem(item, matchingItem);
    });
  });
};

export const filterItemsKeepingParentsAndChildren = <Item extends BaseItem>(
  items: Item[],
  filterCallback: (item: Item) => boolean
): Item[] => {
  const matchingItems = items.filter(filterCallback);
  return items.filter((item) => {
    return !!matchingItems.find((matchingItem) => {
      return (
        matchingItem === item ||
        isParentItem(item, matchingItem) ||
        isChildItem(item, matchingItem)
      );
    });
  });
};

const sortItems = <Item extends BaseItem>(
  a: Item,
  b: Item,
  items: Item[],
  sortCallback: (a: Item, b: Item) => number
): number => {
  let aPath = [...a.path];
  let bPath = [...b.path];
  const sharedPath: string[] = [];

  while (aPath.length > 0 && bPath.length > 0 && aPath[0] === bPath[0]) {
    aPath.shift();
    const part = bPath.shift()!;
    sharedPath.push(part);
  }

  if (aPath.length === 0 && bPath.length === 0) {
    return sortCallback(a, b);
  }

  if (aPath.length === 0) {
    return -1;
  }

  if (bPath.length === 0) {
    return 1;
  }

  const aParent = getItemByKey(items, pathToKey([...sharedPath, aPath[0]]));
  const bParent = getItemByKey(items, pathToKey([...sharedPath, bPath[0]]));

  if (aParent === undefined || bParent === undefined) {
    throw new Error('Unable to find parent');
  }

  return sortCallback(aParent, bParent);
};

export const useTreeView = <Item extends BaseItem>({
  items,
  selected,
  sortCallback,
  onSelectedItemChange
}: {
  items: Item[];
  selected: Item | undefined;
  sortCallback: (a: Item, b: Item) => number;
  onSelectedItemChange: (item: Item) => void;
}) => {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => sortItems(a, b, items, sortCallback));
  }, [items, sortCallback]);

  const [collapsedItems, setCollapsedItems] = useState<Item[]>([]);

  const isFocusedRef = useRef(false);

  const itemInfoRefs = useRef<Record<string, HTMLElement>>({});
  itemInfoRefs.current = {};

  const [focusedItem, setFocusedItem] = useState(sortedItems[0]);

  useEffect(() => {
    if (selected) {
      setFocusedItem(selected);
    }
  }, [selected]);

  useEffect(() => {
    if (!focusedItem || !isFocusedRef.current) {
      return;
    }

    const key = getKey(focusedItem);
    const ref = itemInfoRefs.current[key];
    ref.focus();
  }, [focusedItem]);

  const isGroupItem = (item: Item) => {
    return items.some((i) => isParentItem(item, i));
  };

  const isCollapsedItem = (item: Item) => {
    // $util.c("What is collapsed:", collapsedItems);
    return (
      collapsedItems
        .map((c) => pathToKey(c.path))
        .includes(pathToKey(item.path)) || !isGroupItem(item)
    );
  };

  const isHiddenItem = (item: Item) => {
    const parents = sortedItems.filter((i) => isParentItem(i, item));
    return parents.some((i) => isCollapsedItem(i));
  };

  const toggleItem = (item: Item) => {
    if (isCollapsedItem(item)) {
      setCollapsedItems(
        collapsedItems.filter((i) => pathToKey(i.path) !== pathToKey(item.path))
      );
      return;
    }

    setCollapsedItems([...collapsedItems, item]);
  };

  const focusNextItem = () => {
    const index = sortedItems.indexOf(focusedItem);
    if (index + 1 === sortedItems.length) {
      return;
    }

    setFocusedItem(sortedItems[index + 1]);
  };

  const focusPrevItem = () => {
    const index = sortedItems.indexOf(focusedItem);
    if (index === 0) {
      return;
    }

    setFocusedItem(sortedItems[index - 1]);
  };

  const focusParentItem = () => {
    const parentItem = getItemByKey(
      sortedItems,
      pathToKey(focusedItem.path.slice(0, -1))
    );
    if (!parentItem) {
      return;
    }

    setFocusedItem(parentItem);
  };

  const focusFirstChildItem = () => {
    const firstChildItem = sortedItems.find((i) => {
      return isParentItem(focusedItem, i);
    });
    if (!firstChildItem) {
      return;
    }

    setFocusedItem(firstChildItem);
  };

  const getRootProps = <T extends HTMLElement>(): React.DetailedHTMLProps<
    React.HTMLAttributes<T>,
    T
  > => {
    return {
      role: 'tree',
      onKeyDown: (event: React.KeyboardEvent<T>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelectedItemChange(focusedItem);
          return;
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault();
          focusNextItem();
          return;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();
          focusPrevItem();
          return;
        }

        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          if (!isCollapsedItem(focusedItem)) {
            toggleItem(focusedItem);
            return;
          }

          focusParentItem();
          return;
        }

        if (event.key === 'ArrowRight') {
          event.preventDefault();
          if (isCollapsedItem(focusedItem)) {
            toggleItem(focusedItem);
            return;
          }

          focusFirstChildItem();
          return;
        }
      }
    };
  };

  const getItemProps = <T extends HTMLElement>(
    item: Item,
    {
      onClick,
      ...rest
    }: React.DetailedHTMLProps<React.HTMLAttributes<T>, T> = {}
  ): React.DetailedHTMLProps<React.HTMLAttributes<T>, T> => {
    return {
      ...rest,
      role: 'treeitem',
      'aria-expanded': false,
      'aria-selected': false,
      tabIndex: focusedItem === item ? 0 : -1,
      ref: (el) => {
        if (el) {
          itemInfoRefs.current[getKey(item)] = el;
        }
      },
      onClick: (e) => {
        onSelectedItemChange(item);
        return onClick?.(e);
      },
      onFocus: (e) => {
        if (e.target === e.currentTarget) {
          isFocusedRef.current = true;
        }
      },
      onBlur: (e) => {
        if (e.target === e.currentTarget) {
          isFocusedRef.current = false;
        }
      }
    };
  };

  return {
    sortedItems,
    getRootProps,
    getItemProps,
    isGroupItem,
    isCollapsedItem,
    isHiddenItem,
    toggleItem,
    setCollapsedItems,
    focusedItem
  };
};
