/* global CMS, createClass, h */
/**
 * Decap CMS 自定义「表格」widget
 * 把 { headers: [...], rows: [[...]] } 渲染成一张真正的可编辑表格，
 * 每个单元格直接对应网页上的表格格子（所见即所得），
 * 支持添加/删除行和列。
 *
 * 依赖 decap-cms.js 暴露的全局 window.CMS / window.h / window.createClass。
 */
(function () {
  var EMPTY = { headers: [''], rows: [['']] };

  function normalize(value) {
    // 防御：某些情况下 Decap CMS 可能把对象值序列化成字符串
    if (typeof value === 'string') {
      try { value = JSON.parse(value); } catch (e) { value = null; }
    }
    if (!value || typeof value !== 'object') return { headers: [''], rows: [['']] };
    var headers = Array.isArray(value.headers) ? value.headers : [''];
    var rows = Array.isArray(value.rows) ? value.rows : [['']];
    if (headers.length === 0) headers = [''];
    if (rows.length === 0) rows = [headers.map(function () { return ''; })];
    return { headers: headers, rows: rows };
  }

  var TableControl = createClass({
    handleHeaderChange: function (colIndex, e) {
      var v = normalize(this.props.value);
      v.headers[colIndex] = e.target.value;
      this.props.onChange({ headers: v.headers, rows: v.rows });
    },
    handleCellChange: function (rowIndex, colIndex, e) {
      var v = normalize(this.props.value);
      v.rows[rowIndex][colIndex] = e.target.value;
      this.props.onChange({ headers: v.headers, rows: v.rows });
    },
    addRow: function () {
      var v = normalize(this.props.value);
      var cols = v.headers.length;
      var newRow = [];
      for (var i = 0; i < cols; i++) newRow.push('');
      this.props.onChange({ headers: v.headers, rows: v.rows.concat([newRow]) });
    },
    addCol: function () {
      var v = normalize(this.props.value);
      var headers = v.headers.concat(['列名']);
      var rows = v.rows.map(function (r) { return r.concat(['']); });
      this.props.onChange({ headers: headers, rows: rows });
    },
    removeRow: function (rowIndex) {
      var v = normalize(this.props.value);
      var rows = v.rows.filter(function (_, ri) { return ri !== rowIndex; });
      this.props.onChange({ headers: v.headers, rows: rows });
    },
    removeCol: function (colIndex) {
      var v = normalize(this.props.value);
      var headers = v.headers.filter(function (_, ci) { return ci !== colIndex; });
      var rows = v.rows.map(function (r) { return r.filter(function (_, ci) { return ci !== colIndex; }); });
      this.props.onChange({ headers: headers, rows: rows });
    },
    render: function () {
      var v = normalize(this.props.value);
      var headers = v.headers;
      var rows = v.rows;
      var self = this;

      return h('div', { className: 'hygoal-table-editor' },
        h('table', { className: 'hygoal-table' },
          h('thead', null,
            h('tr', null,
              headers.map(function (header, ci) {
                return h('th', { key: ci, className: 'hygoal-th' },
                  h('input', {
                    value: header,
                    onChange: self.handleHeaderChange.bind(self, ci),
                    placeholder: '列名'
                  }),
                  h('button', {
                    type: 'button',
                    className: 'hygoal-del',
                    title: '删除列',
                    onClick: self.removeCol.bind(self, ci)
                  }, '×')
                );
              })
            )
          ),
          h('tbody', null,
            rows.map(function (row, ri) {
              return h('tr', { key: ri },
                row.map(function (cell, ci) {
                  return h('td', { key: ci, className: 'hygoal-td' },
                    h('input', {
                      value: cell,
                      onChange: self.handleCellChange.bind(self, ri, ci)
                    })
                  );
                }),
                h('td', { className: 'hygoal-td hygoal-del-cell' },
                  h('button', {
                    type: 'button',
                    className: 'hygoal-del',
                    title: '删除行',
                    onClick: self.removeRow.bind(self, ri)
                  }, '×')
                )
              );
            })
          )
        ),
        h('div', { className: 'hygoal-table-actions' },
          h('button', { type: 'button', className: 'hygoal-add', onClick: this.addRow }, '＋ 添加行'),
          h('button', { type: 'button', className: 'hygoal-add', onClick: this.addCol }, '＋ 添加列')
        )
      );
    }
  });

  var TablePreview = createClass({
    render: function () {
      var value = this.props.value;
      if (!value) return null;
      var v = normalize(value);
      return h('table', { className: 'hygoal-table hygoal-table-preview' },
        h('thead', null,
          h('tr', null, v.headers.map(function (hd, i) { return h('th', { key: i }, hd); }))
        ),
        h('tbody', null,
          v.rows.map(function (row, ri) {
            return h('tr', { key: ri },
              row.map(function (cell, ci) { return h('td', { key: ci }, cell); })
            );
          })
        )
      );
    }
  });

  CMS.registerWidget('table', TableControl, TablePreview);
})();
