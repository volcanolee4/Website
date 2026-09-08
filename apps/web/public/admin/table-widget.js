/* global CMS, createClass, h */
/**
 * Decap CMS 自定义「表格」widget
 * 把 { headers: [...], rows: [[...]] } 渲染成一张真正的可编辑表格，
 * 每个单元格直接对应网页上的表格格子（所见即所得）。
 *
 * 功能：
 *  - 在任意位置插入/删除行（上方 / 下方），插入/删除列（左侧 / 右侧）
 *  - 单元格字体（font-family）、字号（px）编辑
 *  - 常用工程符号一键插入（Ø ± × ° ′ ″ µ 等）
 *
 * 数据格式（向后兼容旧数据，旧数据里单元格都是纯字符串）：
 *   - 单元格可以是字符串（无格式），或对象 { text, font, size }（带格式）
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

  // 单元格 → 内部统一结构 { text, font, size }
  function toCell(cell) {
    if (cell == null) return { text: '', font: '', size: '' };
    if (typeof cell === 'string') return { text: cell, font: '', size: '' };
    if (typeof cell === 'number') return { text: String(cell), font: '', size: '' };
    if (typeof cell === 'object') {
      return {
        text: cell.text == null ? '' : String(cell.text),
        font: cell.font || '',
        size: cell.size == null ? '' : String(cell.size)
      };
    }
    return { text: '', font: '', size: '' };
  }

  // 内部结构 → 存储结构：无格式时退回纯字符串，有格式时输出 { text, font, size }
  function fromCell(cell) {
    var hasFont = !!(cell.font && String(cell.font).trim());
    var hasSize = !!(cell.size && String(cell.size).trim());
    if (!hasFont && !hasSize) return cell.text;
    var out = { text: cell.text };
    if (hasFont) out.font = cell.font;
    if (hasSize) out.size = cell.size;
    return out;
  }

  // Decap 传入的 value → 内部结构 { headers: [str], rows: [[cell]] }
  function parse(value) {
    if (value && typeof value.toJS === 'function') value = value.toJS();
    if (typeof value === 'string') {
      try { value = JSON.parse(value); } catch (e) { value = null; }
    }
    if (!value || typeof value !== 'object') value = { headers: [''], rows: [['']] };

    var headers = (Array.isArray(value.headers) && value.headers.length > 0)
      ? value.headers.map(function (h) { return h == null ? '' : String(h); })
      : [''];

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
      headers: t.headers.slice(),
      rows: t.rows.map(function (row) { return row.map(fromCell); })
    };
  }

  var TableControl = createClass({
    getInitialState: function () {
      return { selected: null }; // { ri, ci } 数据格；{ header: ci } 表头
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

    // —— 选择 ——
    selectHeader: function (ci, e) {
      this._activeEl = e.target;
      this.setState({ selected: { header: ci } });
    },
    selectCell: function (ri, ci, e) {
      this._activeEl = e.target;
      this.setState({ selected: { ri: ri, ci: ci } });
    },

    // —— 编辑内容 ——
    setHeader: function (ci, e) {
      var t = parse(this.props.value);
      t.headers[ci] = e.target.value;
      this.props.onChange(serialize(t));
    },
    setCellText: function (ri, ci, e) {
      var t = parse(this.props.value);
      var row = t.rows[ri];
      if (row && row[ci]) row[ci].text = e.target.value;
      this.props.onChange(serialize(t));
    },

    // —— 格式 ——
    setFont: function (e) {
      var sel = this.state.selected;
      if (!sel || sel.header != null) return;
      var t = parse(this.props.value);
      var row = t.rows[sel.ri];
      if (row && row[sel.ci]) row[sel.ci].font = e.target.value;
      this.props.onChange(serialize(t));
    },
    setSize: function (e) {
      var sel = this.state.selected;
      if (!sel || sel.header != null) return;
      var t = parse(this.props.value);
      var row = t.rows[sel.ri];
      if (row && row[sel.ci]) row[sel.ci].size = e.target.value;
      this.props.onChange(serialize(t));
    },
    insertSymbol: function (sym) {
      var sel = this.state.selected;
      if (!sel) return;
      var t = parse(this.props.value);
      var el = this._activeEl;
      var isHeader = sel.header != null;
      var text;
      if (isHeader) {
        text = t.headers[sel.ci];
      } else {
        var row = t.rows[sel.ri];
        if (!row || !row[sel.ci]) return;
        text = row[sel.ci].text;
      }
      var start = el && typeof el.selectionStart === 'number' ? el.selectionStart : text.length;
      var end = el && typeof el.selectionEnd === 'number' ? el.selectionEnd : start;
      var newText = text.slice(0, start) + sym + text.slice(end);

      if (isHeader) {
        t.headers[sel.ci] = newText;
      } else {
        t.rows[sel.ri][sel.ci].text = newText;
      }
      this._pendingCaret = isHeader
        ? { header: true, ci: sel.ci, pos: start + sym.length }
        : { ri: sel.ri, ci: sel.ci, pos: start + sym.length };
      this.props.onChange(serialize(t));
    },

    // —— 行列增删 ——
    insertRow: function (ri, before) {
      var t = parse(this.props.value);
      var idx = before ? ri : ri + 1;
      var newRow = t.headers.map(function () { return { text: '', font: '', size: '' }; });
      t.rows.splice(idx, 0, newRow);
      this.props.onChange(serialize(t));
    },
    insertCol: function (ci, before) {
      var t = parse(this.props.value);
      var idx = before ? ci : ci + 1;
      t.headers.splice(idx, 0, '');
      t.rows.forEach(function (row) { row.splice(idx, 0, { text: '', font: '', size: '' }); });
      this.props.onChange(serialize(t));
    },
    removeRow: function (ri) {
      var t = parse(this.props.value);
      if (t.rows.length <= 1) return;
      t.rows.splice(ri, 1);
      this.setState({ selected: null });
      this.props.onChange(serialize(t));
    },
    removeCol: function (ci) {
      var t = parse(this.props.value);
      if (t.headers.length <= 1) return;
      t.headers.splice(ci, 1);
      t.rows.forEach(function (row) { row.splice(ci, 1); });
      this.setState({ selected: null });
      this.props.onChange(serialize(t));
    },
    addRow: function () {
      var t = parse(this.props.value);
      var newRow = t.headers.map(function () { return { text: '', font: '', size: '' }; });
      t.rows.push(newRow);
      this.props.onChange(serialize(t));
    },
    addCol: function () {
      var t = parse(this.props.value);
      t.headers.push('');
      t.rows.forEach(function (row) { row.push({ text: '', font: '', size: '' }); });
      this.props.onChange(serialize(t));
    },

    render: function () {
      var self = this;
      var t = parse(this.props.value);
      var headers = t.headers;
      var rows = t.rows;
      var sel = this.state.selected;
      var isHeaderSel = !!(sel && sel.header != null);

      // 当前选中单元格的格式（用于工具栏回显）
      var curFont = '';
      var curSize = '';
      if (sel && sel.header == null) {
        var cur = rows[sel.ri] && rows[sel.ri][sel.ci];
        if (cur) { curFont = cur.font; curSize = cur.size; }
      }

      var fontOptions = FONTS.slice();
      if (curFont && !fontOptions.some(function (f) { return f.value === curFont; })) {
        fontOptions.push({ label: curFont, value: curFont });
      }

      return h('div', { className: 'hygoal-table-editor' },

        // —— 格式 / 符号工具栏 ——
        h('div', { className: 'hygoal-toolbar' },
          h('span', { className: 'hygoal-toolbar-label' }, '字体'),
          h('select', {
            className: 'hygoal-select',
            value: curFont,
            disabled: isHeaderSel,
            title: isHeaderSel ? '请先选中一个数据单元格' : '选择字体',
            onChange: this.setFont
          }, fontOptions.map(function (f) {
            return h('option', { key: f.value, value: f.value }, f.label);
          })),
          h('span', { className: 'hygoal-toolbar-label' }, '字号'),
          h('select', {
            className: 'hygoal-select',
            value: curSize,
            disabled: isHeaderSel,
            title: isHeaderSel ? '请先选中一个数据单元格' : '选择字号',
            onChange: this.setSize
          }, SIZES.map(function (s) {
            return h('option', { key: s, value: s }, s === '' ? '默认' : s + ' px');
          })),
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
          h('span', { className: 'hygoal-toolbar-hint' },
            sel
              ? ('已选中：' + (isHeaderSel ? '第 ' + (sel.ci + 1) + ' 列标题' : '第 ' + (sel.ri + 1) + ' 行 · 第 ' + (sel.ci + 1) + ' 列'))
              : '点击任意单元格后可设置字体 / 字号 / 插入符号')
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
                return h('th', {
                  key: 'h' + ci,
                  className: 'hygoal-th' + (sel && sel.header === ci ? ' hygoal-selected' : '')
                },
                  h('input', {
                    value: header,
                    placeholder: '列名',
                    onChange: self.setHeader.bind(self, ci),
                    onFocus: self.selectHeader.bind(self, ci),
                    ref: function (n) { (self._headerRefs = self._headerRefs || {})[ci] = n; }
                  }),
                  h('div', { className: 'hygoal-col-actions' },
                    h('button', { type: 'button', className: 'hygoal-act', title: '在左侧插入列', onClick: function () { self.insertCol(ci, true); } }, '◀'),
                    h('button', { type: 'button', className: 'hygoal-act', title: '在右侧插入列', onClick: function () { self.insertCol(ci, false); } }, '▶'),
                    h('button', { type: 'button', className: 'hygoal-del', title: '删除列', onClick: function () { self.removeCol(ci); } }, '×')
                  )
                );
              }).concat([h('th', { key: 'corner', className: 'hygoal-corner' })])
            )
          ),
          h('tbody', null,
            rows.map(function (row, ri) {
              var cells = row.map(function (cell, ci) {
                var style = {};
                if (cell.font) style.fontFamily = cell.font;
                if (cell.size) style.fontSize = cell.size + 'px';
                var isSel = !!(sel && sel.header == null && sel.ri === ri && sel.ci === ci);
                return h('td', { key: 'c' + ci, className: 'hygoal-td' + (isSel ? ' hygoal-selected' : '') },
                  h('input', {
                    value: cell.text,
                    style: style,
                    onChange: self.setCellText.bind(self, ri, ci),
                    onFocus: self.selectCell.bind(self, ri, ci),
                    ref: function (n) { (self._cellRefs = self._cellRefs || {})[ri + '-' + ci] = n; }
                  })
                );
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
      return h('table', { className: 'hygoal-table hygoal-table-preview' },
        h('thead', null,
          h('tr', null, t.headers.map(function (hd, i) { return h('th', { key: i }, hd); }))
        ),
        h('tbody', null,
          t.rows.map(function (row, ri) {
            return h('tr', { key: ri },
              row.map(function (cell, ci) {
                var style = {};
                if (cell.font) style.fontFamily = cell.font;
                if (cell.size) style.fontSize = cell.size + 'px';
                return h('td', { key: ci, style: style }, cell.text);
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

  CMS.registerWidget('table', TableControl, TablePreview);
})();
