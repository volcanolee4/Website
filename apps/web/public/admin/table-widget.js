/* global CMS, createClass, h */
/**
 * Decap CMS 自定义「表格」widget
 * 把 { headers: [...], rows: [[...]] } 渲染成一张真正的可编辑表格，
 * 每个单元格（含表头）直接对应网页上的表格格子（所见即所得）。
 *
 * 功能：
 *  - 在任意位置插入/删除行（上方 / 下方），插入/删除列（左侧 / 右侧）
 *  - 单元格与表头：字体（font-family）、字号（px）编辑
 *  - 单元格与表头：加粗（bold）、水平对齐（靠左 / 居中 / 靠右）
 *  - 全选（表头 + 所有数据单元格），批量设置字体 / 字号 / 加粗 / 对齐
 *  - 常用工程符号一键插入（Ø ± × ° ′ ″ µ 等）
 *
 * 数据格式（向后兼容旧数据，旧数据里表头与单元格都是纯字符串）：
 *   - 表头/单元格可以是字符串（无格式），或对象 { text, font, size, align, bold }（带格式）
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
  function emptyCell() { return { text: '', font: '', size: '', align: '', bold: false }; }

  // 单元格/表头 → 内部统一结构 { text, font, size, align, bold }
  function toCell(cell) {
    if (cell == null) return emptyCell();
    if (typeof cell === 'string') return { text: cell, font: '', size: '', align: '', bold: false };
    if (typeof cell === 'number') return { text: String(cell), font: '', size: '', align: '', bold: false };
    if (typeof cell === 'object') {
      return {
        text: cell.text == null ? '' : String(cell.text),
        font: cell.font || '',
        size: cell.size == null ? '' : String(cell.size),
        align: cell.align || '',
        bold: !!cell.bold
      };
    }
    return emptyCell();
  }

  // 内部结构 → 存储结构：无格式时退回纯字符串，有格式时输出 { text, font, size, align, bold }
  function fromCell(cell) {
    var hasFont = !!(cell.font && String(cell.font).trim());
    var hasSize = !!(cell.size && String(cell.size).trim());
    var hasAlign = !!(cell.align && String(cell.align).trim());
    var hasBold = !!cell.bold;
    if (!hasFont && !hasSize && !hasAlign && !hasBold) return cell.text;
    var out = { text: cell.text };
    if (hasFont) out.font = cell.font;
    if (hasSize) out.size = cell.size;
    if (hasAlign) out.align = cell.align;
    if (hasBold) out.bold = true;
    return out;
  }

  // Decap 传入的 value → 内部结构 { headers: [cell], rows: [[cell]] }
  function parse(value) {
    if (value && typeof value.toJS === 'function') value = value.toJS();
    if (typeof value === 'string') {
      try { value = JSON.parse(value); } catch (e) { value = null; }
    }
    if (!value || typeof value !== 'object') value = { headers: [''], rows: [['']] };

    var headers = (Array.isArray(value.headers) && value.headers.length > 0)
      ? value.headers.map(function (h) { return toCell(h); })
      : [toCell('')];

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
      return { selected: null }; // { ri, ci } 数据格；{ header: ci } 表头；{ all: true } 全选
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
    toggleSelectAll: function () {
      var sel = this.state.selected;
      this.setState({ selected: (sel && sel.all) ? null : { all: true } });
    },

    // 当前选中范围对应的目标坐标列表（表头 / 数据格 / 全选）
    getTargets: function (sel, t) {
      if (!sel) return [];
      if (sel.all) {
        var list = [];
        t.headers.forEach(function (_, ci) { list.push({ header: ci }); });
        t.rows.forEach(function (row, ri) {
          row.forEach(function (_, ci) { list.push({ ri: ri, ci: ci }); });
        });
        return list;
      }
      if (sel.header != null) return [{ header: sel.ci }];
      return [{ ri: sel.ri, ci: sel.ci }];
    },

    // 取某个目标（表头或数据格）对应的内部单元格对象
    getCell: function (t, target) {
      if (target.header != null) return t.headers[target.ci];
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
      var sel = this.state.selected;
      if (!sel) return;
      var t = parse(this.props.value);
      var el = this._activeEl;
      var isHeader = sel.header != null;
      var cell = isHeader
        ? t.headers[sel.ci]
        : (t.rows[sel.ri] && t.rows[sel.ri][sel.ci]);
      if (!cell) return;
      var text = cell.text;
      var start = el && typeof el.selectionStart === 'number' ? el.selectionStart : text.length;
      var end = el && typeof el.selectionEnd === 'number' ? el.selectionEnd : start;
      cell.text = text.slice(0, start) + sym + text.slice(end);

      this._pendingCaret = isHeader
        ? { header: true, ci: sel.ci, pos: start + sym.length }
        : { ri: sel.ri, ci: sel.ci, pos: start + sym.length };
      this.props.onChange(serialize(t));
    },

    // —— 行列增删 ——
    insertRow: function (ri, before) {
      var t = parse(this.props.value);
      var idx = before ? ri : ri + 1;
      var newRow = t.headers.map(function () { return emptyCell(); });
      t.rows.splice(idx, 0, newRow);
      this.props.onChange(serialize(t));
    },
    insertCol: function (ci, before) {
      var t = parse(this.props.value);
      var idx = before ? ci : ci + 1;
      t.headers.splice(idx, 0, emptyCell());
      t.rows.forEach(function (row) { row.splice(idx, 0, emptyCell()); });
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

    render: function () {
      var self = this;
      var t = parse(this.props.value);
      var headers = t.headers;
      var rows = t.rows;
      var sel = this.state.selected;
      var isHeaderSel = !!(sel && sel.header != null);
      var isAllSel = !!(sel && sel.all);

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
          h('span', { className: 'hygoal-toolbar-hint' },
            sel
              ? (isAllSel
                ? '已全选：表头 + ' + rows.length + ' 行 × ' + headers.length + ' 列'
                : (isHeaderSel ? '第 ' + (sel.ci + 1) + ' 列标题' : '第 ' + (sel.ri + 1) + ' 行 · 第 ' + (sel.ci + 1) + ' 列'))
              : '点击单元格或表头后设置字体 / 字号 / 加粗 / 对齐，或点「全选」批量设置')
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
                var hstyle = {};
                if (header.font) hstyle.fontFamily = header.font;
                if (header.size) hstyle.fontSize = header.size + 'px';
                if (header.align) hstyle.textAlign = header.align;
                if (header.bold) hstyle.fontWeight = 'bold';
                var hSel = !!(sel && (sel.all || sel.header === ci));
                return h('th', {
                  key: 'h' + ci,
                  className: 'hygoal-th' + (hSel ? ' hygoal-selected' : '')
                },
                  h('input', {
                    value: header.text,
                    placeholder: '列名',
                    style: hstyle,
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
                if (cell.align) style.textAlign = cell.align;
                if (cell.bold) style.fontWeight = 'bold';
                var isSel = !!(sel && (sel.all || (sel.header == null && sel.ri === ri && sel.ci === ci)));
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
            return h('th', { key: i, style: cellStyle(hd) }, hd.text);
          }))
        ),
        h('tbody', null,
          t.rows.map(function (row, ri) {
            return h('tr', { key: ri },
              row.map(function (cell, ci) {
                return h('td', { key: ci, style: cellStyle(cell) }, cell.text);
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
