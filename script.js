/**
File: script.js
GUI Assignment: This javascript file generates multiple tables based on four numeric inputs provided by the user (horizontal and vertical start/end values)
Kevin Kuang, UMass Lowell Computer Science, kevin_kuang@student.uml.edu
Copyright (c) 2025 by Kuang. All rights reserved. May be freely copied or
excerpted for educational purposes with credit to the author.
updated by KK on June 12, 2025 at 4:28 PM
*/
$(function() {
  const MIN = -50, MAX = 50;
  let count = 0;

  const $tabs = $('#tabs').tabs();
  const $list = $('#tab-list');

  const $hStart = $('#hStart'), $hEnd = $('#hEnd');
  const $vStart = $('#vStart'), $vEnd = $('#vEnd');
function initPair(inputSel, sliderSel, initVal) {
    $(inputSel).val(initVal);
    $(sliderSel).slider({
      range: 'min', min: MIN, max: MAX, value: initVal,
      slide(_evt, ui) {
        $(inputSel).val(ui.value).trigger('change');
      }
    });
    $(inputSel).on('change input', function() {
      let v = parseInt(this.value, 10);
      if (isNaN(v)) v = MIN;
      v = Math.max(MIN, Math.min(MAX, v));
      $(this).val(v);
      $(sliderSel).slider('value', v);
      renderEntry();
    });
  }
initPair('#hStart', '#sliderHStart', MIN);
  initPair('#hEnd',   '#sliderHEnd',   0);
  initPair('#vStart', '#sliderVStart', MIN);
  initPair('#vEnd',   '#sliderVEnd',   0);
  $.validator.addMethod('leq', (val, el, sel) =>
    parseInt(val,10) <= parseInt($(sel).val(),10),
    'Must be ≤ paired field'
  );
  $('#tableForm').validate({
    rules: {
      hStart: { required:true, number:true, min:MIN, max:MAX, leq:'#hEnd' },
      hEnd:   { required:true, number:true, min:MIN, max:MAX },
      vStart: { required:true, number:true, min:MIN, max:MAX, leq:'#vEnd' },
      vEnd:   { required:true, number:true, min:MIN, max:MAX }
    },
    errorPlacement(err, el) { err.insertAfter(el); },
    submitHandler() {
      addTable();
      return false;
    }
  });

  // build table HTML
  function build(h1,h2,v1,v2) {
    let html = '<table><thead><tr><th></th>';
    for (let c=h1; c<=h2; c++) html += `<th>${c}</th>`;
    html += '</tr></thead><tbody>';
    for (let r=v1; r<=v2; r++) {
      html += `<tr><th>${r}</th>`;
      for (let c=h1; c<=h2; c++) html += `<td>${r*c}</td>`;
      html += '</tr>';
    }
    html += '</tbody></table>';
    return html;
  }

  // heatmap styling
  function heatmap($panel) {
    const $cells = $panel.find('td');
    const vals = $cells.map((i,td) => +$(td).text()).get();
    const minV = Math.min(...vals), maxV = Math.max(...vals);
    $cells.each(function() {
      const v = +$(this).text();
      const pct = maxV>minV ? (v-minV)/(maxV-minV) : 0;
      $(this).css('background-color', `rgba(244,67,54,${pct.toFixed(2)})`);
    });
  }

  // render live under Entry
  function renderEntry() {
    const hs=+$hStart.val(), he=+$hEnd.val();
    const vs=+$vStart.val(), ve=+$vEnd.val();
    const $ent = $('#entryTable').html(build(hs,he,vs,ve));
    heatmap($ent);
  }

  // add a new Table N tab
  function addTable() {
    const hs=+$hStart.val(), he=+$hEnd.val();
    const vs=+$vStart.val(), ve=+$vEnd.val();
    count++;
    const id = `tab-${count}`;
    $list.append(
      `<li><a href="#${id}">Table ${count}</a>` +
      `<span class="ui-icon ui-icon-close"></span></li>`
    );
    $tabs.append(
      `<div id="${id}" class="scroll-container">` + build(hs,he,vs,ve) + `</div>`
    );
    $tabs.tabs('refresh').tabs('option','active',$list.children().length-1);
    heatmap($(`#${id}`));
  } $('#clearTabsBtn').click(() => {
    $list.find('li:gt(0)').remove();
    $tabs.find('> div:gt(0)').remove();
    $tabs.tabs('refresh').tabs('option','active',0);
    count = 0;
  });
  $tabs.on('click', '.ui-icon-close', function() {
    const $li=$(this).closest('li');
    const panel=$li.find('a').attr('href');
    $li.remove();
    $(panel).remove();
    $tabs.tabs('refresh').tabs('option','active',0);
  });
  renderEntry();
});