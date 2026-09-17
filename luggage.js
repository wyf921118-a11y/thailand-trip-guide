(() => {
  'use strict';

  const seedNames = [
    ['手机卡', 1],
    ['现金 4k泰铢', 1],
    ['护照', 1],
    ['牙刷牙膏旅行装', 1],
    ['充电宝', 1],
    ['钥匙', 1],
    ['颈枕', 1],
    ['化妆品（眼影腮红口红眉笔睫毛膏睫毛夹假睫毛眼线笔修容粉饼定妆粉底液遮瑕高光）', 1],
    ['充电器', 1],
    ['一次性内裤', 1],
    ['速干浴巾', 1],
    ['衣服（工装裤短袖；牛仔裤吊带；旗袍；裙子，睡衣，防晒衣）', 1],
    ['纸巾（干纸巾、湿纸巾）', 1],
    ['卷发棒', 1],
    ['便携卸妆膏', 4],
    ['伞', 1],
    ['胸贴', 1],
    ['牙线', 1],
    ['梳子', 1]
  ];

  const seedItems = seedNames.map(([name, quantity], index) => ({
    id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    list_type: 'owner',
    name,
    quantity,
    packed: false,
    last_minute: false,
    carrier: null,
    sort_order: (index + 1) * 10,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString()
  }));

  const suggestions = [
    { key: 'phone', name: '手机', terms: ['手机', '备用手机'], exact: true },
    { key: 'medicine', name: '常用药', terms: ['药', '创可贴'] },
    { key: 'sunscreen', name: '防晒霜', terms: ['防晒霜', '防晒喷雾'] },
    { key: 'adapter', name: '转换插头', terms: ['转换插头', '转换器'] },
    { key: 'earphones', name: '耳机', terms: ['耳机'] },
    { key: 'bank_card', name: '银行卡', terms: ['银行卡', '信用卡'] },
    { key: 'itinerary', name: '电子行程单', terms: ['行程单', '机票订单'] }
  ];

  const config = window.THAILAND_LUGGAGE_CONFIG || {};
  const backendEnabled = Boolean(config.supabaseUrl && config.anonKey);
  const state = {
    items: seedItems.map((item) => ({ ...item })),
    settings: { id: 'main', owner_name: '王渝斐', friend_name: '朋友', updated_at: new Date(0).toISOString() },
    suggestionChoices: {},
    activeList: 'owner',
    onlyUnpacked: false,
    busyIds: new Set(),
    undo: null,
    undoTimer: null
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const els = {
    sync: $('#luggageSyncState'),
    progress: $('#packingProgress'),
    tabs: $('#luggageTabs'),
    filter: $('#onlyUnpacked'),
    listProgress: $('#activeListProgress'),
    list: $('#packingList'),
    empty: $('#emptyPackingList'),
    sharingNote: $('#luggageSharingNote'),
    itemDialog: $('#itemDialog'),
    itemForm: $('#itemForm'),
    itemId: $('#itemId'),
    itemName: $('#itemName'),
    itemQuantity: $('#itemQuantity'),
    itemPacked: $('#itemPacked'),
    itemLastMinute: $('#itemLastMinute'),
    carrierField: $('#carrierField'),
    itemCarrier: $('#itemCarrier'),
    itemDialogTitle: $('#itemDialogTitle'),
    itemDialogEyebrow: $('#itemDialogEyebrow'),
    namesDialog: $('#namesDialog'),
    namesForm: $('#namesForm'),
    ownerName: $('#ownerName'),
    friendName: $('#friendName'),
    missingDialog: $('#missingDialog'),
    missingContent: $('#missingCheckContent'),
    finalDialog: $('#finalDialog'),
    finalContent: $('#finalCheckContent'),
    undo: $('#luggageUndo')
  };

  if (!els.list) return;

  const listLabels = () => ({
    owner: state.settings.owner_name || '你',
    friend: state.settings.friend_name || '朋友',
    shared: '共同物品'
  });

  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#i-${name}`);
    svg.append(use);
    return svg;
  }

  function setSync(kind, text) {
    els.sync.className = `sync-state is-${kind}`;
    els.sync.replaceChildren(document.createElement('span'), document.createTextNode(text));
  }

  function setDemoSync() {
    setSync('demo', '未连接共享数据库');
  }

  function showUndo(item, deleteTask = null) {
    window.clearTimeout(state.undoTimer);
    state.undo = { item, deleteTask };
    $('span', els.undo).textContent = `已删除“${item.name}”`;
    els.undo.hidden = false;
    state.undoTimer = window.setTimeout(() => {
      els.undo.hidden = true;
      state.undo = null;
    }, 6000);
  }

  function openDialog(dialog) {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function closeDialog(dialog) {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
      const random = Math.random() * 16 | 0;
      return (character === 'x' ? random : (random & 3 | 8)).toString(16);
    });
  }

  function normalized(text) {
    return String(text || '').toLowerCase().replace(/[\s（）()，,、；;·.\-_/]/g, '');
  }

  function apiHeaders(extra = {}) {
    return {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      'Content-Type': 'application/json',
      ...extra
    };
  }

  async function api(path, options = {}) {
    if (!navigator.onLine) throw new Error('当前离线，未提交修改');
    const response = await fetch(`${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/${path}`, {
      ...options,
      headers: apiHeaders(options.headers)
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `请求失败（${response.status}）`);
    }
    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  async function loadRemote({ quiet = false } = {}) {
    if (!backendEnabled) {
      setDemoSync();
      return;
    }
    if (!quiet) setSync('saving', '正在同步');
    try {
      const [items, settings, choices] = await Promise.all([
        api('luggage_items?select=*&order=sort_order.asc,created_at.asc'),
        api('luggage_settings?id=eq.main&select=*'),
        api('luggage_suggestion_choices?select=*')
      ]);
      state.items = Array.isArray(items) ? items : [];
      if (settings?.[0]) state.settings = settings[0];
      state.suggestionChoices = Object.fromEntries((choices || []).map((choice) => [choice.suggestion_key, choice]));
      renderAll();
      setSync('synced', '已同步');
      els.sharingNote.textContent = '修改会逐条自动保存。拿到链接的人都能查看和修改；同时编辑同一条物品时会提示并刷新最新版本。';
    } catch (error) {
      setSync('failed', navigator.onLine ? '同步失败' : '当前离线');
      els.sharingNote.textContent = `共享清单暂时无法读取：${error.message}`;
    }
  }

  function countFor(type) {
    const items = state.items.filter((item) => item.list_type === type);
    return { packed: items.filter((item) => item.packed).length, total: items.length };
  }

  function renderProgress() {
    const labels = listLabels();
    els.progress.replaceChildren(...['owner', 'friend', 'shared'].map((type) => {
      const count = countFor(type);
      const node = document.createElement('div');
      node.className = 'progress-item';
      const name = document.createElement('strong');
      name.textContent = labels[type];
      const value = document.createElement('span');
      value.textContent = `已装包 ${count.packed}／${count.total} 项`;
      node.append(name, value);
      return node;
    }));
  }

  function renderTabs() {
    const labels = listLabels();
    els.tabs.replaceChildren(...['owner', 'friend', 'shared'].map((type) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'luggage-tab';
      button.role = 'tab';
      button.dataset.listType = type;
      button.setAttribute('aria-selected', String(state.activeList === type));
      button.textContent = type === 'shared' ? labels[type] : `${labels[type]}的行李`;
      return button;
    }));
  }

  function makeTag(text, className) {
    const span = document.createElement('span');
    span.className = className;
    span.textContent = text;
    return span;
  }

  function renderList() {
    const labels = listLabels();
    const all = state.items.filter((item) => item.list_type === state.activeList);
    const visible = all.filter((item) => !state.onlyUnpacked || !item.packed);
    const packed = all.filter((item) => item.packed).length;
    els.listProgress.replaceChildren();
    const strong = document.createElement('strong');
    strong.textContent = `已装包 ${packed}／${all.length} 项`;
    const hint = document.createElement('span');
    hint.textContent = '按物品条目计数';
    els.listProgress.append(strong, hint);

    els.list.replaceChildren(...visible.map((item) => {
      const row = document.createElement('li');
      row.className = `packing-item${item.packed ? ' is-packed' : ''}`;
      row.dataset.itemId = item.id;

      const checkLabel = document.createElement('label');
      checkLabel.className = 'packing-check';
      const check = document.createElement('input');
      check.type = 'checkbox';
      check.checked = item.packed;
      check.disabled = state.busyIds.has(item.id);
      check.dataset.action = 'toggle-packed';
      check.setAttribute('aria-label', `${item.packed ? '取消装包' : '标记已装包'}：${item.name}`);
      checkLabel.append(check);

      const main = document.createElement('div');
      main.className = 'packing-main';
      main.append(makeTag(item.name, 'packing-name'), makeTag(`×${item.quantity}`, 'packing-quantity'));
      if (item.last_minute) main.append(makeTag('临出门装入', 'last-minute-tag'));
      if (item.list_type === 'shared') {
        const carrierName = item.carrier ? labels[item.carrier] : '尚未分工';
        main.append(makeTag(`携带：${carrierName}`, `carrier-tag${item.carrier ? '' : ' is-empty'}`));
      }

      const menu = document.createElement('div');
      menu.className = 'item-menu';
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'item-icon-button';
      edit.dataset.action = 'edit';
      edit.setAttribute('aria-label', `编辑${item.name}`);
      edit.append(icon('edit'));
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'item-icon-button delete';
      remove.dataset.action = 'delete';
      remove.setAttribute('aria-label', `删除${item.name}`);
      remove.append(icon('trash'));
      menu.append(edit, remove);
      row.append(checkLabel, main, menu);
      return row;
    }));

    const hasVisible = visible.length > 0;
    els.empty.hidden = hasVisible;
    if (!hasVisible) {
      els.empty.replaceChildren();
      const title = document.createElement('strong');
      title.textContent = all.length && state.onlyUnpacked ? '这一份已经全部装包' : '这份清单还是空的';
      const text = document.createTextNode(all.length && state.onlyUnpacked ? '取消“只看未装包”可查看已完成项目。' : '点击下方按钮添加第一件物品。');
      els.empty.append(title, text);
    }
  }

  function renderAll() {
    renderProgress();
    renderTabs();
    renderList();
    if (els.missingDialog.open) renderMissingCheck();
    if (els.finalDialog.open) renderFinalCheck();
  }

  function listDescription(type) {
    const labels = listLabels();
    if (type === 'shared') return '共同物品';
    return `${labels[type]}的行李`;
  }

  function refreshCarrierOptions(selected = '') {
    const labels = listLabels();
    els.itemCarrier.replaceChildren();
    [['', '尚未分工'], ['owner', labels.owner], ['friend', labels.friend]].forEach(([value, label]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      option.selected = value === selected;
      els.itemCarrier.append(option);
    });
  }

  function openItemForm(item = null) {
    const editing = Boolean(item);
    els.itemForm.reset();
    els.itemId.value = item?.id || '';
    els.itemName.value = item?.name || '';
    els.itemQuantity.value = item?.quantity || 1;
    els.itemPacked.checked = Boolean(item?.packed);
    els.itemLastMinute.checked = Boolean(item?.last_minute);
    els.carrierField.hidden = state.activeList !== 'shared';
    refreshCarrierOptions(item?.carrier || '');
    els.itemDialogTitle.textContent = editing ? '修改物品' : '添加物品';
    els.itemDialogEyebrow.textContent = `${editing ? '编辑' : '添加到'}${listDescription(state.activeList)}`;
    openDialog(els.itemDialog);
    window.setTimeout(() => els.itemName.focus(), 30);
  }

  async function createItem(data, { preserveId = false } = {}) {
    const now = new Date().toISOString();
    const item = {
      id: preserveId && data.id ? data.id : uuid(),
      list_type: data.list_type || state.activeList,
      name: data.name.trim(),
      quantity: Number(data.quantity) || 1,
      packed: Boolean(data.packed),
      last_minute: Boolean(data.last_minute),
      carrier: (data.list_type || state.activeList) === 'shared' ? (data.carrier || null) : null,
      sort_order: data.sort_order ?? Math.max(0, ...state.items.filter((entry) => entry.list_type === (data.list_type || state.activeList)).map((entry) => entry.sort_order || 0)) + 10,
      created_at: data.created_at || now,
      updated_at: now
    };
    state.items.push(item);
    renderAll();
    if (!backendEnabled) {
      setDemoSync();
      return item;
    }
    setSync('saving', '保存中');
    try {
      const rows = await api('luggage_items', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(item)
      });
      Object.assign(item, rows?.[0] || {});
      setSync('synced', '已同步');
      renderAll();
      return item;
    } catch (error) {
      state.items = state.items.filter((entry) => entry.id !== item.id);
      renderAll();
      setSync('failed', '保存失败');
      throw error;
    }
  }

  async function updateItem(id, changes) {
    const item = state.items.find((entry) => entry.id === id);
    if (!item || state.busyIds.has(id)) return;
    const before = { ...item };
    if (backendEnabled && !navigator.onLine) {
      setSync('failed', '当前离线 · 未保存');
      return;
    }
    Object.assign(item, changes);
    state.busyIds.add(id);
    renderAll();
    if (!backendEnabled) {
      state.busyIds.delete(id);
      setDemoSync();
      renderAll();
      return;
    }
    setSync('saving', '保存中');
    try {
      const filterTime = encodeURIComponent(before.updated_at);
      const rows = await api(`luggage_items?id=eq.${encodeURIComponent(id)}&updated_at=eq.${filterTime}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(changes)
      });
      if (!rows?.length) {
        await loadRemote({ quiet: true });
        throw new Error('这条物品刚被另一位同行修改，已刷新最新版本');
      }
      Object.assign(item, rows[0]);
      setSync('synced', '已同步');
    } catch (error) {
      Object.assign(item, before);
      setSync('failed', error.message.includes('另一位') ? '内容有更新 · 已刷新' : '保存失败');
    } finally {
      state.busyIds.delete(id);
      renderAll();
    }
  }

  async function deleteItem(id) {
    const index = state.items.findIndex((item) => item.id === id);
    if (index < 0) return;
    const [item] = state.items.splice(index, 1);
    renderAll();
    if (!backendEnabled) {
      showUndo(item);
      setDemoSync();
      return;
    }
    const deleteTask = (async () => {
      setSync('saving', '保存中');
      try {
        const rows = await api(`luggage_items?id=eq.${encodeURIComponent(id)}&updated_at=eq.${encodeURIComponent(item.updated_at)}`, {
          method: 'DELETE',
          headers: { Prefer: 'return=representation' }
        });
        if (!rows?.length) throw new Error('删除冲突');
        setSync('synced', '已同步');
        return true;
      } catch (error) {
        state.items.splice(index, 0, item);
        els.undo.hidden = true;
        state.undo = null;
        setSync('failed', '删除失败');
        renderAll();
        return false;
      }
    })();
    showUndo(item, deleteTask);
    await deleteTask;
  }

  async function saveNames(ownerName, friendName) {
    const before = { ...state.settings };
    state.settings.owner_name = ownerName;
    state.settings.friend_name = friendName;
    renderAll();
    if (!backendEnabled) {
      setDemoSync();
      return;
    }
    setSync('saving', '保存中');
    try {
      const rows = await api(`luggage_settings?id=eq.main&updated_at=eq.${encodeURIComponent(before.updated_at)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ owner_name: ownerName, friend_name: friendName })
      });
      if (!rows?.length) {
        await loadRemote({ quiet: true });
        throw new Error('姓名已由另一位同行更新');
      }
      state.settings = rows[0];
      setSync('synced', '已同步');
    } catch (error) {
      state.settings = before;
      setSync('failed', '保存失败');
      renderAll();
    }
  }

  function section(title, items, emptyText, renderer) {
    const wrapper = document.createElement('section');
    wrapper.className = 'check-section';
    const head = document.createElement('div');
    head.className = 'check-section-head';
    const heading = document.createElement('h3');
    heading.textContent = title;
    const count = document.createElement('span');
    count.className = 'check-count';
    count.textContent = `${items.length} 项`;
    head.append(heading, count);
    wrapper.append(head);
    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'check-empty';
      empty.textContent = emptyText;
      wrapper.append(empty);
      return wrapper;
    }
    const list = document.createElement('ul');
    list.className = 'check-list';
    items.forEach((item) => list.append(renderer(item)));
    wrapper.append(list);
    return wrapper;
  }

  function renderMissingCheck() {
    const labels = listLabels();
    const unpacked = state.items.filter((item) => !item.packed);
    const unassigned = state.items.filter((item) => item.list_type === 'shared' && !item.carrier);
    const allNames = state.items.map((item) => normalized(item.name));
    const candidates = suggestions.filter((suggestion) => {
      if (state.suggestionChoices[suggestion.key]?.decision === 'skipped') return false;
      return !suggestion.terms.some((term) => allNames.some((name) => suggestion.exact ? name === normalized(term) : name.includes(normalized(term))));
    });

    const unpackedSection = section('尚未装包', unpacked, '清单内物品已全部装包。', (item) => {
      const li = document.createElement('li');
      const type = item.list_type === 'shared' ? '共同物品' : labels[item.list_type];
      const text = document.createElement('span');
      text.textContent = `${type} · ${item.name} ×${item.quantity}`;
      li.append(text);
      if (item.last_minute) li.append(makeTag('计划出门时装入', 'last-minute-tag'));
      return li;
    });
    const unassignedSection = section('尚未分工', unassigned, '共同物品都已指定携带人。', (item) => {
      const li = document.createElement('li');
      const text = document.createElement('span');
      text.textContent = item.name;
      li.append(text, makeTag('尚未指定携带人', 'carrier-tag is-empty'));
      return li;
    });
    const candidateSection = section('可能需要补充', candidates, '基础旅行清单中的候选项已处理。', (suggestion) => {
      const li = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = suggestion.name;
      const actions = document.createElement('div');
      actions.className = 'suggestion-actions';
      const add = document.createElement('button');
      add.type = 'button';
      add.className = 'micro-button primary';
      add.dataset.suggestionAction = 'add';
      add.dataset.suggestionKey = suggestion.key;
      add.textContent = '加入';
      const skip = document.createElement('button');
      skip.type = 'button';
      skip.className = 'micro-button';
      skip.dataset.suggestionAction = 'skip';
      skip.dataset.suggestionKey = suggestion.key;
      skip.textContent = '不需要';
      actions.append(add, skip);
      li.append(name, actions);
      return li;
    });
    els.missingContent.replaceChildren(unpackedSection, unassignedSection, candidateSection);
  }

  async function saveSuggestionDecision(key, decision) {
    const previous = state.suggestionChoices[key];
    state.suggestionChoices[key] = { suggestion_key: key, decision, updated_at: new Date().toISOString() };
    renderMissingCheck();
    if (!backendEnabled) return;
    setSync('saving', '保存中');
    try {
      const rows = await api('luggage_suggestion_choices?on_conflict=suggestion_key', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({ suggestion_key: key, decision })
      });
      state.suggestionChoices[key] = rows?.[0] || state.suggestionChoices[key];
      setSync('synced', '已同步');
    } catch (error) {
      if (previous) state.suggestionChoices[key] = previous;
      else delete state.suggestionChoices[key];
      renderMissingCheck();
      setSync('failed', '保存失败');
    }
  }

  function finalItemNode(item) {
    const labels = listLabels();
    const row = document.createElement('div');
    row.className = `final-item${item.packed ? ' is-packed' : ''}`;
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = item.packed;
    input.disabled = state.busyIds.has(item.id);
    input.dataset.finalItemId = item.id;
    const text = document.createElement('span');
    const carrier = item.list_type === 'shared' ? ` · 携带：${item.carrier ? labels[item.carrier] : '尚未分工'}` : '';
    text.textContent = `${item.name} ×${item.quantity}${carrier}`;
    label.append(input, text);
    row.append(label);
    return row;
  }

  function renderFinalCheck() {
    const labels = listLabels();
    const all = state.items.filter((item) => item.last_minute);
    const remaining = all.filter((item) => !item.packed).length;
    const summary = document.createElement('p');
    summary.className = `final-summary${all.length && remaining === 0 ? ' is-complete' : ''}`;
    if (!all.length) summary.textContent = '还没有标记物品。给需要出发前再收起的物品添加“临出门装入”标记。';
    else if (remaining === 0) summary.textContent = '临出门物品已全部装包';
    else summary.textContent = `还有 ${remaining} 项临出门物品未装包`;

    const content = document.createDocumentFragment();
    content.append(summary);
    ['owner', 'friend', 'shared'].forEach((type) => {
      const items = all.filter((item) => item.list_type === type);
      const group = document.createElement('section');
      group.className = 'final-group';
      const heading = document.createElement('h3');
      heading.textContent = type === 'shared' ? '共同物品' : `${labels[type]}的物品`;
      group.append(heading);
      const pending = items.filter((item) => !item.packed);
      const completed = items.filter((item) => item.packed);
      if (!pending.length) {
        const empty = document.createElement('p');
        empty.className = 'check-empty';
        empty.textContent = items.length ? '已全部装包' : '没有标记物品';
        group.append(empty);
      } else {
        pending.forEach((item) => group.append(finalItemNode(item)));
      }
      if (completed.length) {
        const details = document.createElement('details');
        details.className = 'completed-final';
        const summaryNode = document.createElement('summary');
        summaryNode.textContent = `已完成项目（${completed.length}）`;
        details.append(summaryNode);
        completed.forEach((item) => details.append(finalItemNode(item)));
        group.append(details);
      }
      content.append(group);
    });
    els.finalContent.replaceChildren(content);
  }

  els.tabs.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-list-type]');
    if (!tab) return;
    state.activeList = tab.dataset.listType;
    renderTabs();
    renderList();
  });

  els.filter.addEventListener('change', () => {
    state.onlyUnpacked = els.filter.checked;
    renderList();
  });

  els.list.addEventListener('change', (event) => {
    const checkbox = event.target.closest('[data-action="toggle-packed"]');
    if (!checkbox) return;
    const row = checkbox.closest('[data-item-id]');
    updateItem(row.dataset.itemId, { packed: checkbox.checked });
  });

  els.list.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]');
    if (!action || action.dataset.action === 'toggle-packed') return;
    const row = action.closest('[data-item-id]');
    const item = state.items.find((entry) => entry.id === row?.dataset.itemId);
    if (!item) return;
    if (action.dataset.action === 'edit') openItemForm(item);
    if (action.dataset.action === 'delete') deleteItem(item.id);
  });

  $('#addLuggageItem').addEventListener('click', () => openItemForm());
  $('#openMissingCheck').addEventListener('click', () => {
    renderMissingCheck();
    openDialog(els.missingDialog);
  });
  $('#openFinalCheck').addEventListener('click', () => {
    renderFinalCheck();
    openDialog(els.finalDialog);
  });
  $('#editNames').addEventListener('click', () => {
    els.ownerName.value = state.settings.owner_name;
    els.friendName.value = state.settings.friend_name;
    openDialog(els.namesDialog);
  });

  document.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));
  document.querySelectorAll('.luggage-dialog').forEach((dialog) => dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog(dialog);
  }));

  els.itemForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = els.itemName.value.trim();
    if (!name) return;
    const changes = {
      name,
      quantity: Math.max(1, Math.min(99, Number(els.itemQuantity.value) || 1)),
      packed: els.itemPacked.checked,
      last_minute: els.itemLastMinute.checked,
      carrier: state.activeList === 'shared' ? (els.itemCarrier.value || null) : null
    };
    const id = els.itemId.value;
    closeDialog(els.itemDialog);
    if (id) await updateItem(id, changes);
    else {
      try { await createItem({ ...changes, list_type: state.activeList }); } catch (error) { /* 状态区已显示失败 */ }
    }
  });

  els.namesForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const owner = els.ownerName.value.trim();
    const friend = els.friendName.value.trim();
    if (!owner || !friend) return;
    closeDialog(els.namesDialog);
    await saveNames(owner, friend);
  });

  els.missingContent.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-suggestion-action]');
    if (!button) return;
    const suggestion = suggestions.find((entry) => entry.key === button.dataset.suggestionKey);
    if (!suggestion) return;
    button.disabled = true;
    if (button.dataset.suggestionAction === 'skip') {
      await saveSuggestionDecision(suggestion.key, 'skipped');
      return;
    }
    try {
      await createItem({ name: suggestion.name, quantity: 1, list_type: state.activeList });
      await saveSuggestionDecision(suggestion.key, 'added');
    } catch (error) {
      renderMissingCheck();
    }
  });

  els.finalContent.addEventListener('change', (event) => {
    const input = event.target.closest('[data-final-item-id]');
    if (!input) return;
    updateItem(input.dataset.finalItemId, { packed: input.checked });
  });

  $('button', els.undo).addEventListener('click', async () => {
    if (!state.undo) return;
    const { item, deleteTask } = state.undo;
    state.undo = null;
    window.clearTimeout(state.undoTimer);
    els.undo.hidden = true;
    if (deleteTask && !(await deleteTask)) return;
    try { await createItem(item, { preserveId: true }); } catch (error) { /* 状态区已显示失败 */ }
  });

  window.addEventListener('offline', () => {
    if (backendEnabled) setSync('failed', '当前离线 · 不会提交');
  });
  window.addEventListener('online', () => loadRemote());
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && backendEnabled) loadRemote({ quiet: true });
  });

  renderAll();
  if (backendEnabled) {
    loadRemote();
    window.setInterval(() => loadRemote({ quiet: true }), 15000);
  } else {
    setDemoSync();
  }
})();
