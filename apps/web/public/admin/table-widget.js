/* global CMS, createClass, h */
/**
 * Decap CMS 自定义「表格」widget
 * 把 { headers: [...], rows: [[...]] } 渲染成一张真正的可编辑表格，
 * 每个单元格（含表头）直接对应网页上的表格格子（所见即所得）。
 *
 * 功能：
 *  - 拖动鼠标框选一个或多个单元格（矩形选区，含表头多列）
 *  - 清除选中单元格内容
 *  - 合并 / 拆分单元格（支持 colspan / rowspan，表头支持横向合并）
 *  - 插入 / 删除指定数量的行、列（在末尾追加 / 从末尾删除，不改变原有排版）
 *  - 删除整张表格（清空为空白表）
 *  - 在任意位置插入/删除行（上方 / 下方）、插入/删除列（左侧 / 右侧）
 *  - 单元格与表头：字体（font-family）、字号（px）、加粗（bold）、水平对齐
 *  - 全选（表头 + 所有数据单元格），批量设置字体 / 字号 / 加粗 / 对齐
 *  - 常用工程符号一键插入（Ø ± × ° ′ ″ µ 等）
 *
 * 数据格式（向后兼容旧数据，旧数据里表头与单元格都是纯字符串）：
 *   - 表头/单元格可以是字符串（无格式），或对象 { text, font, size, align, bold }（带格式）
 *   - 合并后单元格增加 colspan / rowspan（>1 才写入），被覆盖的位置用 null 占位
 *   - align 取值：'left' | 'center' | 'right'；bold 为布尔值
 *
 * 依赖 decap-cms.js 暴露的全局 window.CMS / window.h / window.createClass。
 */
(function () {
  // —— 可选字体（value 为 CSS font-family）——
  var FONTS = [
    { label: '默认字体', value: '' },
    { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
    { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
    { label: 'Calibri', value: 'Calibri, Candara, sans-serif' },
    { label: 'Georgia', value: 'Georgia, "Times New Roman", serif' },
    { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { label: 'Courier New', value: '"Courier New", Courier, monospace' },
    { label: '微软雅黑', value: '"Microsoft YaHei", "微软雅黑", "PingFang SC", sans-serif' },
    { label: '宋体', value: 'SimSun, "宋体", serif' },
    { label: '黑体', value: 'SimHei, "黑体", sans-serif' }
  ];

  // —— 可选字号（px，空串 = 默认继承）——
  var SIZES = ['', '10', '11', '12', '13', '14', '16', '18', '20', '24', '28', '32'];

  // —— 常用工程符号 ——
  var SYMBOLS = [
    'Ø', '±', '×', '°', '′', '″', 'µ', '⁄', '½', '¼', '¾',
    '≤', '≥', '≈', '≠', 'α', 'β', 'γ', '∆', 'π', '·', '–', '—'
  ];

  // 空白单元格
  function emptyCell() { return { text: '', font: '', size: '', align: '', bold: false, colspan: 1, rowspan: 1 }; }

  // 单元格/表头 → 内部统一结构 { text, font, size, align, bold, colspan, rowspan }；null 表示被合并覆盖的占位
  function toCell(cell) {
    if (cell == null) return null;
    if (typeof cell === 'string') return { text: cell, font: '', size: '', align: '', bold: false, colspan: 1, rowspan: 1 };
    if (typeof cell === 'number') return { text: String(cell), font: '', size: '', align: '', bold: false, colspan: 1, rowspan: 1 };
    if (typeof cell === 'object') {
      return {
        text: cell.text == null ? '' : String(cell.text),
        font: cell.font || '',
        size: cell.size == null ? '' : String(cell.size),
        align: cell.align || '',
        bold: !!cell.bold,
        colspan: cell.colspan > 1 ? Number(cell.colspan) : 1,
        rowspan: cell.rowspan > 1 ? Number(cell.rowspan) : 1
      };
    }
    return emptyCell();
  }

  // 内部结构 → 存储结构：无格式时退回纯字符串，有格式/合并时输出对象；null 保持 null
  function fromCell(cell) {
    if (cell == null) return null;
    var hasFont = !!(cell.font && String(cell.font).trim());
    var hasSize = !!(cell.size && String(cell.size).trim());
    var hasAlign = !!(cell.align && String(cell.align).trim());
    var hasBold = !!cell.bold;
    var cs = cell.colspan > 1 ? Number(cell.colspan) : 0;
    var rs = cell.rowspan > 1 ? Number(cell.rowspan) : 0;
    if (!hasFont && !hasSize && !hasAlign && !hasBold && !cs && !rs) return cell.text;
    var out = { text: cell.text };
    if (hasFont) out.font = cell.font;
    if (hasSize) out.size = cell.size;
    if (hasAlign) out.align = cell.align;
    if (hasBold) out.bold = true;
    if (cs) out.colspan = cs;
    if (rs) out.rowspan = rs;
    return out;
  }

  // Decap 传入的 value → 内部结构 { headers: [cell], rows: [[cell]] }（null = 被合并覆盖）
  function parse(value) {
    if (value && typeof value.toJS === 'function') value = value.toJS();
    if (typeof value === 'string') {
      try { value = JSON.parse(value); } catch (e) { value = null; }
    }
    if (!value || typeof value !== 'object') value = { headers: [''], rows: [['']] };

    var headers = (Array.isArray(value.headers) && value.headers.length > 0)
      ? value.headers.map(function (h) { return toCell(h); })
      : [emptyCell()];

    var rows = (Array.isArray(value.rows) && value.rows.length > 0) ? value.rows : [[]];

    var cells = rows.map(function (row) {
      if (!Array.isArray(row)) row = [];
      var out = [];
      for (var i = 0; i < headers.length; i++) out.push(toCell(row[i]));
      return out;
    });

    return { headers: headers, rows: cells };
  }

  // 内部结构 → 存储结构
  function serialize(t) {
    return {
      headers: t.headers.map(fromCell),
      rows: t.rows.map(function (row) { return row.map(fromCell); })
    };
  }

  var TableControl = createClass({
    getInitialState: function () {
      return {
        selected: null,            // null | { type:'cells', r1,c1,r2,c2 } | { type:'header', c1,c2 } | { type:'all' }
        insRows: '1', insCols: '1', delRows: '1', delCols: '1'
      };
    },

    componentDidMount: function () {
      var self = this;
      this._onDocMouseUp = function () { self._selecting = false; };
      document.addEventListener('mouseup', this._onDocMouseUp);
    },
    componentWillUnmount: function () {
      if (this._onDocMouseUp) document.removeEventListener('mouseup', this._onDocMouseUp);
    },

    componentDidUpdate: function () {
      // 插入符号后恢复光标位置（避免焦点/光标丢失）
      if (!this._pendingCaret) return;
      var p = this._pendingCaret;
      this._pendingCaret = null;
      var el = p.header
        ? (this._headerRefs && this._headerRefs[p.ci])
        : (this._cellRefs && this._cellRefs[p.ri + '-' + p.ci]);
      if (el) {
        el.focus();
        try { el.setSelectionRange(p.pos, p.pos); } catch (err) { /* ignore */ }
      }
    },

    // —— 选择（拖动框选）——
    toggleSelectAll: function () {
      var sel = this.state.selected;
      this.setState({ selected: (sel && sel.type === 'all') ? null : { type: 'all' } });
    },
    startCellSelect: function (ri, ci, e) {
      this._selecting = true;
      this._selAnchor = { ri: ri, ci: ci };
      this._activeCell = { ri: ri, ci: ci };
      this._activeEl = e.target;
      this.setState({ selected: { type: 'cells', r1: ri, c1: ci, r2: ri, c2: ci } });
    },
    extendCellSelect: function (ri, ci) {
      if (!this._selecting || !this._selAnchor) return;
      var a = this._selAnchor;
      this.setState({
        selected: {
          type: 'cells',
          r1: Math.min(a.ri, ri), c1: Math.min(a.ci, ci),
          r2: Math.max(a.ri, ri), c2: Math.max(a.ci, ci)
        }
      });
    },
    startHeaderSelect: function (ci, e) {
      this._selecting = true;
      this._selAnchor = { header: ci };
      this._activeCell = { header: ci };
      this._activeEl = e.target;
      this.setState({ selected: { type: 'header', c1: ci, c2: ci } });
    },
    extendHeaderSelect: function (ci) {
      if (!this._selecting || !this._selAnchor) return;
      var a = this._selAnchor;
      this.setState({ selected: { type: 'header', c1: Math.min(a.header, ci), c2: Math.max(a.header, ci) } });
    },
    focusCell: function (ri, ci, e) {
      this._activeEl = e.target;
      this._activeCell = { ri: ri, ci: ci };
      if (!this._selecting) this.setState({ selected: { type: 'cells', r1: ri, c1: ci, r2: ri, c2: ci } });
    },
    focusHeader: function (ci, e) {
      this._activeEl = e.target;
      this._activeCell = { header: ci };
      if (!this._selecting) this.setState({ selected: { type: 'header', c1: ci, c2: ci } });
    },

    isCellSelected: function (sel, ri, ci) {
      if (!sel) return false;
      if (sel.type === 'all') return true;
      if (sel.type === 'cells') return ri >= sel.r1 && ri <= sel.r2 && ci >= sel.c1 && ci <= sel.c2;
      return false;
    },
    isHeaderSelected: function (sel, ci) {
      if (!sel) return false;
      if (sel.type === 'all') return true;
      if (sel.type === 'header') return ci >= sel.c1 && ci <= sel.c2;
      return false;
    },

    // 当前选中范围对应的目标坐标列表（表头 / 数据格 / 全选；自动跳过被合并覆盖的 null）
    getTargets: function (sel, t) {
      if (!sel) return [];
      var list = [];
      if (sel.type === 'all') {
        t.headers.forEach(function (h, ci) { if (h != null) list.push({ header: ci }); });
        t.rows.forEach(function (row, ri) {
          row.forEach(function (c, ci) { if (c != null) list.push({ ri: ri, ci: ci }); });
        });
      } else if (sel.type === 'header') {
        for (var ci = sel.c1; ci <= sel.c2; ci++) {
          if (t.headers[ci] != null) list.push({ header: ci });
        }
      } else if (sel.type === 'cells') {
        for (var ri = sel.r1; ri <= sel.r2; ri++) {
          for (var ci = sel.c1; ci <= sel.c2; ci++) {
            if (t.rows[ri] && t.rows[ri][ci] != null) list.push({ ri: ri, ci: ci });
          }
        }
      }
      return list;
    },

    // 取某个目标（表头或数据格）对应的内部单元格对象
    getCell: function (t, target) {
      if (target.header != null) return t.headers[target.header];
      var row = t.rows[target.ri];
      return row ? row[target.ci] : null;
    },

    // —— 编辑内容 ——
    setHeader: function (ci, e) {
      var t = parse(this.props.value);
      var h = t.headers[ci];
      if (h) h.text = e.target.value;
      this.props.onChange(serialize(t));
    },
    setCellText: function (ri, ci, e) {
      var t = parse(this.props.value);
      var row = t.rows[ri];
      if (row && row[ci]) row[ci].text = e.target.value;
      this.props.onChange(serialize(t));
    },

    // —— 格式（表头 + 数据格统一处理）——
    setFormat: function (field, value) {
      var sel = this.state.selected;
      if (!sel) return;
      var t = parse(this.props.value);
      var self = this;
      this.getTargets(sel, t).forEach(function (tg) {
        var cell = self.getCell(t, tg);
        if (cell) cell[field] = value;
      });
      this.props.onChange(serialize(t));
    },
    setFont: function (e) {
      this.setFormat('font', e.target.value);
    },
    setSize: function (e) {
      this.setFormat('size', e.target.value);
    },
    setAlign: function (align) {
      this.setFormat('align', align);
    },
    toggleBold: function () {
      var sel = this.state.selected;
      if (!sel) return;
      var t = parse(this.props.value);
      var self = this;
      var targets = this.getTargets(sel, t);
      if (!targets.length) return;
      var allBold = targets.every(function (tg) {
        var cell = self.getCell(t, tg);
        return !!cell && !!cell.bold;
      });
      var newBold = !allBold;
      targets.forEach(function (tg) {
        var cell = self.getCell(t, tg);
        if (cell) cell.bold = newBold;
      });
      this.props.onChange(serialize(t));
    },
    insertSymbol: function (sym) {
      var t = parse(this.props.value);
      var el = this._activeEl;
      var target = this._activeCell;
      if (!target) return;
      var cell = this.getCell(t, target);
      if (!cell) return;
      var text = cell.text;
      var start = el && typeof el.selectionStart === 'number' ? el.selectionStart : text.length;
      var end = el && typeof el.selectionEnd === 'number' ? el.selectionEnd : start;
      cell.text = text.slice(0, start) + sym + text.slice(end);

      this._pendingCaret = target.header != null
        ? { header: true, ci: target.header, pos: start + sym.length }
        : { ri: target.ri, ci: target.ci, pos: start + sym.length };
      this.props.onChange(serialize(t));
    },

    // —— 清除选中内容 ——
    clearSelection: function () {
      var sel = this.state.selected;
      if (!sel) return;
      var t = parse(this.props.value);
      var self = this;
      this.getTargets(sel, t).forEach(function (tg) {
        var cell = self.getCell(t, tg);
        if (cell) cell.text = '';
      });
      this.props.onChange(serialize(t));
    },

    // —— 合并 / 拆分 ——
    canMerge: function (sel, t) {
      if (!sel) return false;
      if (sel.type === 'cells') {
        if (sel.r1 === sel.r2 && sel.c1 === sel.c2) return false;
        for (var ri = sel.r1; ri <= sel.r2; ri++) {
          for (var ci = sel.c1; ci <= sel.c2; ci++) {
            var c = t.rows[ri] && t.rows[ri][ci];
            if (!c || c.colspan > 1 || c.rowspan > 1) return false;
          }
        }
        return true;
      }
      if (sel.type === 'header') {
        if (sel.c1 === sel.c2) return false;
        for (var ci = sel.c1; ci <= sel.c2; ci++) {
          var h = t.headers[ci];
          if (!h || h.colspan > 1) return false;
        }
        return true;
      }
      return false;
    },
    canSplit: function (sel, t) {
      if (!sel) return false;
      if (sel.type === 'cells') {
        if (sel.r1 !== sel.r2 || sel.c1 !== sel.c2) return false;
        var c = t.rows[sel.r1] && t.rows[sel.r1][sel.c1];
        return !!c && (c.colspan > 1 || c.rowspan > 1);
      }
      if (sel.type === 'header') {
        if (sel.c1 !== sel.c2) return false;
        var h = t.headers[sel.c1];
        return !!h && h.colspan > 1;
      }
      return false;
    },
    merge: function () {
      var sel = this.state.selected;
      var t = parse(this.props.value);
      if (!this.canMerge(sel, t)) return;
      if (sel.type === 'cells') {
        var r1 = sel.r1, r2 = sel.r2, c1 = sel.c1, c2 = sel.c2;
        var texts = [];
        for (var ri = r1; ri <= r2; ri++) {
          for (var ci = c1; ci <= c2; ci++) {
            var c = t.rows[ri][ci];
            if (c && c.text && c.text.trim()) texts.push(c.text.trim());
          }
        }
        var owner = t.rows[r1][c1];
        owner.text = texts.join(' ');
        owner.colspan = c2 - c1 + 1;
        owner.rowspan = r2 - r1 + 1;
        for (var ri2 = r1; ri2 <= r2; ri2++) {
          for (var ci2 = c1; ci2 <= c2; ci2++) {
            if (ri2 === r1 && ci2 === c1) continue;
            t.rows[ri2][ci2] = null;
          }
        }
        this.setState({ selected: { type: 'cells', r1: r1, c1: c1, r2: r1, c2: c1 } });
      } else if (sel.type === 'header') {
        var htexts = [];
        for (var hi = sel.c1; hi <= sel.c2; hi++) {
          var hh = t.headers[hi];
          if (hh && hh.text && hh.text.trim()) htexts.push(hh.text.trim());
        }
        var hOwner = t.headers[sel.c1];
        hOwner.text = htexts.join(' ');
        hOwner.colspan = sel.c2 - sel.c1 + 1;
        for (var hj = sel.c1 + 1; hj <= sel.c2; hj++) t.headers[hj] = null;
        this.setState({ selected: { type: 'header', c1: sel.c1, c2: sel.c1 } });
      }
      this.props.onChange(serialize(t));
    },
    split: function () {
      var sel = this.state.selected;
      var t = parse(this.props.value);
      if (!this.canSplit(sel, t)) return;
      if (sel.type === 'cells') {
        var r = sel.r1, c = sel.c1;
        var cell = t.rows[r][c];
        var cs = cell.colspan > 1 ? cell.colspan : 1;
        var rs = cell.rowspan > 1 ? cell.rowspan : 1;
        for (var ri = r; ri < r + rs; ri++) {
          for (var ci = c; ci < c + cs; ci++) {
            if (ri === r && ci === c) continue;
            if (t.rows[ri] && t.rows[ri][ci] === null) t.rows[ri][ci] = emptyCell();
          }
        }
        cell.colspan = 1;
        cell.rowspan = 1;
      } else if (sel.type === 'header') {
        var hh = t.headers[sel.c1];
        var hcs = hh.colspan > 1 ? hh.colspan : 1;
        for (var hj = sel.c1 + 1; hj < sel.c1 + hcs; hj++) {
          if (t.headers[hj] === null) t.headers[hj] = emptyCell();
        }
        hh.colspan = 1;
      }
      this.props.onChange(serialize(t));
    },

    // —— 行列增删 ——
    // 结构化改动后统一重算合并占位，保证 grid 始终一致（null 占位与 colspan/rowspan 对得上）
    clampSpans: function (t) {
      var ncol = t.headers.length;
      t.headers.forEach(function (h, ci) {
        if (h != null && h.colspan > 1) h.colspan = Math.max(1, Math.min(h.colspan, ncol - ci));
      });
      var nrow = t.rows.length;
      t.rows.forEach(function (row, ri) {
        row.forEach(function (c, ci) {
          if (c != null) {
            if (c.colspan > 1) c.colspan = Math.max(1, Math.min(c.colspan, ncol - ci));
            if (c.rowspan > 1) c.rowspan = Math.max(1, Math.min(c.rowspan, nrow - ri));
          }
        });
      });
    },
    normalizeGrid: function (t) {
      this.clampSpans(t);
      var ncol = t.headers.length;
      var nrow = t.rows.length;
      // 1) 先把所有 null 占位还原成空单元格
      t.headers.forEach(function (h, ci) { if (h == null) t.headers[ci] = emptyCell(); });
      t.rows.forEach(function (row) {
        for (var ci = 0; ci < row.length; ci++) if (row[ci] == null) row[ci] = emptyCell();
      });
      // 2) 按 colspan/rowspan 重新标记被覆盖位置为 null
      for (var i = 0; i < ncol; i++) {
        var h = t.headers[i];
        if (h && h.colspan > 1) {
          for (var k = 1; k < h.colspan; k++) if (i + k < ncol) t.headers[i + k] = null;
        }
      }
      for (var ri = 0; ri < nrow; ri++) {
        for (var ci = 0; ci < ncol; ci++) {
          var c = t.rows[ri][ci];
          if (c == null) continue;
          if (c.colspan > 1 || c.rowspan > 1) {
            var rs2 = c.rowspan > 1 ? c.rowspan : 1;
            var cs2 = c.colspan > 1 ? c.colspan : 1;
            for (var dr = 0; dr < rs2; dr++) {
              for (var dc = 0; dc < cs2; dc++) {
                if (dr === 0 && dc === 0) continue;
                var rr = ri + dr, cc = ci + dc;
                if (rr < nrow && cc < ncol) t.rows[rr][cc] = null;
              }
            }
          }
        }
      }
    },

    insertRow: function (ri, before) {
      var t = parse(this.props.value);
      var idx = before ? ri : ri + 1;
      var newRow = t.headers.map(function () { return emptyCell(); });
      t.rows.splice(idx, 0, newRow);
      this.normalizeGrid(t);
      this.props.onChange(serialize(t));
    },
    insertCol: function (ci, before) {
      var t = parse(this.props.value);
      var idx = before ? ci : ci + 1;
      t.headers.splice(idx, 0, emptyCell());
      t.rows.forEach(function (row) { row.splice(idx, 0, emptyCell()); });
      this.normalizeGrid(t);
      this.props.onChange(serialize(t));
    },
    removeRow: function (ri) {
      var t = parse(this.props.value);
      if (t.rows.length <= 1) return;
      t.rows.splice(ri, 1);
      this.normalizeGrid(t);
      this.setState({ selected: null });
      this.props.onChange(serialize(t));
    },
    removeCol: function (ci) {
      var t = parse(this.props.value);
      if (t.headers.length <= 1) return;
      t.headers.splice(ci, 1);
      t.rows.forEach(function (row) { row.splice(ci, 1); });
      this.normalizeGrid(t);
      this.setState({ selected: null });
      this.props.onChange(serialize(t));
    },
    addRow: function () {
      var t = parse(this.props.value);
      var newRow = t.headers.map(function () { return emptyCell(); });
      t.rows.push(newRow);
      this.props.onChange(serialize(t));
    },
    addCol: function () {
      var t = parse(this.props.value);
      t.headers.push(emptyCell());
      t.rows.forEach(function (row) { row.push(emptyCell()); });
      this.props.onChange(serialize(t));
    },

    // —— 指定数量插入 / 删除（在末尾追加 / 从末尾删除，不改变原有排版）——
    insertRows: function () {
      var n = parseInt(this.state.insRows, 10);
      if (!(n > 0)) return;
      var t = parse(this.props.value);
      for (var k = 0; k < n; k++) {
        t.rows.push(t.headers.map(function () { return emptyCell(); }));
      }
      this.props.onChange(serialize(t));
    },
    insertCols: function () {
      var n = parseInt(this.state.insCols, 10);
      if (!(n > 0)) return;
      var t = parse(this.props.value);
      for (var k = 0; k < n; k++) {
        t.headers.push(emptyCell());
        t.rows.forEach(function (row) { row.push(emptyCell()); });
      }
      this.props.onChange(serialize(t));
    },
    deleteRows: function () {
      var n = parseInt(this.state.delRows, 10);
      if (!(n > 0)) return;
      var t = parse(this.props.value);
      var remove = Math.min(n, t.rows.length - 1);
      if (remove <= 0) return;
      t.rows.splice(t.rows.length - remove, remove);
      this.normalizeGrid(t);
      this.setState({ selected: null });
      this.props.onChange(serialize(t));
    },
    deleteCols: function () {
      var n = parseInt(this.state.delCols, 10);
      if (!(n > 0)) return;
      var t = parse(this.props.value);
      var remove = Math.min(n, t.headers.length - 1);
      if (remove <= 0) return;
      t.headers.splice(t.headers.length - remove, remove);
      t.rows.forEach(function (row) { row.splice(row.length - remove, remove); });
      this.normalizeGrid(t);
      this.setState({ selected: null });
      this.props.onChange(serialize(t));
    },
    deleteTable: function () {
      if (!window.confirm('确定删除整张表格？（将清空为一张空白表格）')) return;
      this.setState({ selected: null });
      this.props.onChange(serialize({ headers: [emptyCell()], rows: [[emptyCell()]] }));
    },

    render: function () {
      var self = this;
      var t = parse(this.props.value);
      var headers = t.headers;
      var rows = t.rows;
      var sel = this.state.selected;
      var isAllSel = !!(sel && sel.type === 'all');

      // 当前选中范围的格式（用于工具栏回显；多选时仅当所有格一致才回显）
      var fmtTargets = sel ? this.getTargets(sel, t) : [];
      var curFont = '';
      var curSize = '';
      var curAlign = '';
      var curBold = false;
      if (fmtTargets.length) {
        var first = this.getCell(t, fmtTargets[0]);
        var sameFont = fmtTargets.every(function (tg) { var cell = self.getCell(t, tg); return cell && cell.font === first.font; });
        var sameSize = fmtTargets.every(function (tg) { var cell = self.getCell(t, tg); return cell && cell.size === first.size; });
        var sameAlign = fmtTargets.every(function (tg) { var cell = self.getCell(t, tg); return cell && cell.align === first.align; });
        var sameBold = fmtTargets.every(function (tg) { var cell = self.getCell(t, tg); return cell && !!cell.bold === !!first.bold; });
        if (sameFont) curFont = first.font;
        if (sameSize) curSize = first.size;
        if (sameAlign) curAlign = first.align || '';
        if (sameBold) curBold = !!first.bold;
      }
      var hasTarget = fmtTargets.length > 0;

      var fontOptions = FONTS.slice();
      if (curFont && !fontOptions.some(function (f) { return f.value === curFont; })) {
        fontOptions.push({ label: curFont, value: curFont });
      }

      var mergeOk = this.canMerge(sel, t);
      var splitOk = this.canSplit(sel, t);

      // 选区提示文字
      var hintText = '拖动鼠标框选一个或多个单元格，或用「全选」；选中后可设置格式、合并/拆分、清除内容';
      if (sel) {
        if (sel.type === 'all') {
          hintText = '已全选：表头 + ' + rows.length + ' 行 × ' + headers.length + ' 列';
        } else if (sel.type === 'header') {
          hintText = sel.c1 === sel.c2
            ? '第 ' + (sel.c1 + 1) + ' 列标题'
            : '第 ' + (sel.c1 + 1) + ' ~ ' + (sel.c2 + 1) + ' 列标题（共 ' + (sel.c2 - sel.c1 + 1) + ' 列）';
        } else if (sel.type === 'cells') {
          hintText = (sel.r1 === sel.r2 && sel.c1 === sel.c2)
            ? '第 ' + (sel.r1 + 1) + ' 行 · 第 ' + (sel.c1 + 1) + ' 列'
            : '第 ' + (sel.r1 + 1) + ' ~ ' + (sel.r2 + 1) + ' 行 · 第 ' + (sel.c1 + 1) + ' ~ ' + (sel.c2 + 1) + ' 列（共 ' + ((sel.r2 - sel.r1 + 1) * (sel.c2 - sel.c1 + 1)) + ' 格）';
        }
      }

      return h('div', { className: 'hygoal-table-editor' },

        // —— 格式 / 符号工具栏 ——
        h('div', { className: 'hygoal-toolbar' },
          h('button', {
            type: 'button',
            className: 'hygoal-format-btn hygoal-all' + (isAllSel ? ' hygoal-active' : ''),
            title: '全选表头与所有数据单元格（再点一次取消）',
            onClick: this.toggleSelectAll
          }, '全选'),
          h('span', { className: 'hygoal-toolbar-sep' }),
          h('span', { className: 'hygoal-toolbar-label' }, '字体'),
          h('select', {
            className: 'hygoal-select',
            value: curFont,
            disabled: !hasTarget,
            title: hasTarget ? '选择字体' : '请先选中单元格或表头',
            onChange: this.setFont
          }, fontOptions.map(function (f) {
            return h('option', { key: f.value, value: f.value }, f.label);
          })),
          h('span', { className: 'hygoal-toolbar-label' }, '字号'),
          h('select', {
            className: 'hygoal-select',
            value: curSize,
            disabled: !hasTarget,
            title: hasTarget ? '选择字号' : '请先选中单元格或表头',
            onChange: this.setSize
          }, SIZES.map(function (s) {
            return h('option', { key: s, value: s }, s === '' ? '默认' : s + ' px');
          })),
          h('span', { className: 'hygoal-toolbar-sep' }),
          h('button', {
            type: 'button',
            className: 'hygoal-format-btn hygoal-bold' + (curBold ? ' hygoal-active' : ''),
            title: '加粗',
            disabled: !hasTarget,
            onClick: this.toggleBold
          }, 'B'),
          h('span', { className: 'hygoal-toolbar-label' }, '对齐'),
          h('button', { type: 'button', className: 'hygoal-format-btn' + (curAlign === 'left' ? ' hygoal-active' : ''), title: '靠左对齐', disabled: !hasTarget, onClick: function () { self.setAlign('left'); } }, '左'),
          h('button', { type: 'button', className: 'hygoal-format-btn' + (curAlign === 'center' ? ' hygoal-active' : ''), title: '居中对齐', disabled: !hasTarget, onClick: function () { self.setAlign('center'); } }, '中'),
          h('button', { type: 'button', className: 'hygoal-format-btn' + (curAlign === 'right' ? ' hygoal-active' : ''), title: '靠右对齐', disabled: !hasTarget, onClick: function () { self.setAlign('right'); } }, '右'),
          h('span', { className: 'hygoal-toolbar-sep' }),
          h('span', { className: 'hygoal-toolbar-label' }, '符号'),
          SYMBOLS.map(function (sym) {
            return h('button', {
              key: sym,
              type: 'button',
              className: 'hygoal-sym',
              title: '插入 ' + sym,
              onMouseDown: function (e) { e.preventDefault(); }, // 保持输入框焦点与光标
              onClick: function () { self.insertSymbol(sym); }
            }, sym);
          }),
          h('span', { className: 'hygoal-toolbar-hint' }, hintText)
        ),

        // —— 结构工具栏：合并/拆分/清除 + 指定数量插入/删除行列 + 删除整表 ——
        h('div', { className: 'hygoal-toolbar hygoal-struct' },
          h('button', {
            type: 'button',
            className: 'hygoal-format-btn' + (mergeOk ? '' : ''),
            title: '合并选中的多个单元格（或表头）为一个',
            disabled: !mergeOk,
            onClick: this.merge
          }, '合并'),
          h('button', {
            type: 'button',
            className: 'hygoal-format-btn',
            title: '拆分选中的合并单元格',
            disabled: !splitOk,
            onClick: this.split
          }, '拆分'),
          h('button', {
            type: 'button',
            className: 'hygoal-format-btn',
            title: '清除选中单元格的内容（保留格式）',
            disabled: !hasTarget,
            onClick: this.clearSelection
          }, '清除内容'),
          h('span', { className: 'hygoal-toolbar-sep' }),
          h('span', { className: 'hygoal-toolbar-label' }, '插入行'),
          h('input', { type: 'number', min: '1', className: 'hygoal-num', value: this.state.insRows, onChange: function (e) { self.setState({ insRows: e.target.value }); } }),
          h('button', { type: 'button', className: 'hygoal-format-btn', title: '在末尾插入指定数量的行', onClick: this.insertRows }, '确定'),
          h('span', { className: 'hygoal-toolbar-label' }, '插入列'),
          h('input', { type: 'number', min: '1', className: 'hygoal-num', value: this.state.insCols, onChange: function (e) { self.setState({ insCols: e.target.value }); } }),
          h('button', { type: 'button', className: 'hygoal-format-btn', title: '在末尾插入指定数量的列', onClick: this.insertCols }, '确定'),
          h('span', { className: 'hygoal-toolbar-sep' }),
          h('span', { className: 'hygoal-toolbar-label' }, '删除行'),
          h('input', { type: 'number', min: '1', className: 'hygoal-num', value: this.state.delRows, onChange: function (e) { self.setState({ delRows: e.target.value }); } }),
          h('button', { type: 'button', className: 'hygoal-format-btn', title: '从末尾删除指定数量的行', onClick: this.deleteRows }, '确定'),
          h('span', { className: 'hygoal-toolbar-label' }, '删除列'),
          h('input', { type: 'number', min: '1', className: 'hygoal-num', value: this.state.delCols, onChange: function (e) { self.setState({ delCols: e.target.value }); } }),
          h('button', { type: 'button', className: 'hygoal-format-btn', title: '从末尾删除指定数量的列', onClick: this.deleteCols }, '确定'),
          h('span', { className: 'hygoal-toolbar-sep' }),
          h('button', { type: 'button', className: 'hygoal-del hygoal-del-table', title: '删除整张表格（清空为空白表）', onClick: this.deleteTable }, '删除整表')
        ),

        // —— 表格 ——
        h('table', { className: 'hygoal-table' },
          h('colgroup', null,
            headers.map(function (_, ci) { return h('col', { key: 'c' + ci }); })
              .concat([h('col', { key: 'actions', className: 'hygoal-col-actions-col' })])
          ),
          h('thead', null,
            h('tr', null,
              headers.map(function (header, ci) {
                if (header == null) return null;
                var hstyle = {};
                if (header.font) hstyle.fontFamily = header.font;
                if (header.size) hstyle.fontSize = header.size + 'px';
                if (header.align) hstyle.textAlign = header.align;
                if (header.bold) hstyle.fontWeight = 'bold';
                var colSpan = header.colspan > 1 ? header.colspan : undefined;
                var hSel = self.isHeaderSelected(sel, ci);
                var colActions = header.colspan > 1
                  ? h('div', { className: 'hygoal-col-actions' }, h('span', { className: 'hygoal-col-note' }, '已合并'))
                  : h('div', { className: 'hygoal-col-actions' },
                      h('button', { type: 'button', className: 'hygoal-act', title: '在左侧插入列', onClick: function () { self.insertCol(ci, true); } }, '◀'),
                      h('button', { type: 'button', className: 'hygoal-act', title: '在右侧插入列', onClick: function () { self.insertCol(ci, false); } }, '▶'),
                      h('button', { type: 'button', className: 'hygoal-del', title: '删除列', onClick: function () { self.removeCol(ci); } }, '×')
                    );
                return h('th', {
                  key: 'h' + ci,
                  className: 'hygoal-th' + (hSel ? ' hygoal-selected' : ''),
                  colSpan: colSpan,
                  onMouseDown: function (e) { self.startHeaderSelect(ci, e); },
                  onMouseEnter: function () { self.extendHeaderSelect(ci); }
                },
                  h('input', {
                    value: header.text,
                    placeholder: '列名',
                    style: hstyle,
                    onChange: self.setHeader.bind(self, ci),
                    onFocus: function (e) { self.focusHeader(ci, e); },
                    ref: function (n) { (self._headerRefs = self._headerRefs || {})[ci] = n; }
                  }),
                  colActions
                );
              }).concat([h('th', { key: 'corner', className: 'hygoal-corner' })])
            )
          ),
          h('tbody', null,
            rows.map(function (row, ri) {
              var cells = [];
              row.forEach(function (cell, ci) {
                if (cell == null) return; // 被合并覆盖
                var style = {};
                if (cell.font) style.fontFamily = cell.font;
                if (cell.size) style.fontSize = cell.size + 'px';
                if (cell.align) style.textAlign = cell.align;
                if (cell.bold) style.fontWeight = 'bold';
                var colSpan = cell.colspan > 1 ? cell.colspan : undefined;
                var rowSpan = cell.rowspan > 1 ? cell.rowspan : undefined;
                var isSel = self.isCellSelected(sel, ri, ci);
                cells.push(h('td', {
                  key: 'c' + ci,
                  className: 'hygoal-td' + (isSel ? ' hygoal-selected' : ''),
                  colSpan: colSpan,
                  rowSpan: rowSpan,
                  onMouseDown: function (e) { self.startCellSelect(ri, ci, e); },
                  onMouseEnter: function () { self.extendCellSelect(ri, ci); }
                },
                  h('input', {
                    value: cell.text,
                    style: style,
                    onChange: self.setCellText.bind(self, ri, ci),
                    onFocus: function (e) { self.focusCell(ri, ci, e); },
                    ref: function (n) { (self._cellRefs = self._cellRefs || {})[ri + '-' + ci] = n; }
                  })
                ));
              });
              cells.push(
                h('td', { key: 'rowact', className: 'hygoal-row-actions' },
                  h('button', { type: 'button', className: 'hygoal-act', title: '在上方插入行', onClick: function () { self.insertRow(ri, true); } }, '▲'),
                  h('button', { type: 'button', className: 'hygoal-act', title: '在下方插入行', onClick: function () { self.insertRow(ri, false); } }, '▼'),
                  h('button', { type: 'button', className: 'hygoal-del', title: '删除行', onClick: function () { self.removeRow(ri); } }, '×')
                )
              );
              return h('tr', { key: 'r' + ri }, cells);
            })
          )
        ),

        // —— 底部快捷操作 ——
        h('div', { className: 'hygoal-table-actions' },
          h('button', { type: 'button', className: 'hygoal-add', onClick: this.addRow }, '＋ 在末尾添加行'),
          h('button', { type: 'button', className: 'hygoal-add', onClick: this.addCol }, '＋ 在末尾添加列')
        )
      );
    }
  });

  var TablePreview = createClass({
    render: function () {
      var value = this.props.value;
      if (!value) return null;
      var t = parse(value);
      function cellStyle(cell) {
        var style = {};
        if (cell.font) style.fontFamily = cell.font;
        if (cell.size) style.fontSize = cell.size + 'px';
        if (cell.align) style.textAlign = cell.align;
        if (cell.bold) style.fontWeight = 'bold';
        return style;
      }
      return h('table', { className: 'hygoal-table hygoal-table-preview' },
        h('thead', null,
          h('tr', null, t.headers.map(function (hd, i) {
            if (hd == null) return null;
            var colSpan = hd.colspan > 1 ? hd.colspan : undefined;
            return h('th', { key: i, colSpan: colSpan, style: cellStyle(hd) }, hd.text);
          }))
        ),
        h('tbody', null,
          t.rows.map(function (row, ri) {
            return h('tr', { key: ri },
              row.map(function (cell, ci) {
                if (cell == null) return null;
                var colSpan = cell.colspan > 1 ? cell.colspan : undefined;
                var rowSpan = cell.rowspan > 1 ? cell.rowspan : undefined;
                return h('td', { key: ci, colSpan: colSpan, rowSpan: rowSpan, style: cellStyle(cell) }, cell.text);
              })
            );
          })
        )
      );
    }
  });

  // 值序列化器：告诉 Decap CMS 本组件的值是对象（不是字符串）
  CMS.registerWidgetValueSerializer('table', {
    serialize: function (value) {
      if (value && typeof value.toJS === 'function') return value.toJS();
      return value;
    },
    deserialize: function (value) {
      if (typeof value === 'string') {
        try { return JSON.parse(value); } catch (e) { return { headers: [''], rows: [['']] }; }
      }
      return value;
    }
  });

  if (typeof module !== 'undefined' && module.exports) {
    // 供 node 单测使用（浏览器里 module 未定义，不会执行）
    module.exports = { toCell: toCell, fromCell: fromCell, parse: parse, serialize: serialize };
  }

  CMS.registerWidget('table', TableControl, TablePreview);
})();
