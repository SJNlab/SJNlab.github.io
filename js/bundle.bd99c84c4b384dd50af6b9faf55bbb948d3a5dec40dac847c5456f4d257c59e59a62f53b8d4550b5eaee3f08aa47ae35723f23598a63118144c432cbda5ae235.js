'use strict';

// global variables;
const doc = document.documentElement;
const toggle_id = 'toggle';
const show_id = 'show';
const menu = 'menu';
const active = 'active';
// root_url must end with '/' for relative URLs to work properly
let root_url = '/';
root_url = root_url.startsWith('http') ? root_url : window.location.origin;

const go_back_class = 'button_back';
const line_class = '.line';

// config defined values
const code_block_config = JSON.parse('{"maximum":10,"show":false}');
const iconsPath = `icons/`;

// defined in i18n / translation files
const copy_text = 'Copy';
const copied_text = 'Copied';
const toggle_line_numbers_text = 'Toggle line numbers';
const toggle_line_wrap_text = 'Toggle line wrap';
const resize_snippet = 'Resize snippet height';
const not_set = 'not set';

const shell_based = ['sh', 'shell', 'zsh', 'bash'];

const body = elem('body');
const max_lines = code_block_config.maximum;
const show_lines = code_block_config.show;
const copy_id = 'panel_copy';
const wrap_id = 'panel_wrap';
const lines_id = 'panel_lines';
const panel_expand = 'panel_expand';
const panel_expanded = 'panel_expanded';
const panel_box = 'panel_box';
const panel_hide = 'panel_hide';
const panel_from = 'panel_from';
const full_height = 'initial';
const highlight = 'highlight';
const highlight_wrap = 'highlight_wrap'
const hash = '#';

const light = 'light';
const dark = 'dark';
const storageKey = 'colorMode';
const key = '--color-mode';
const mode_data = 'data-mode';
const bank = window.localStorage;

;
function isObj(obj) {
  return (obj && typeof obj === 'object' && obj !== null) ? true : false;
}

function createEl(element = 'div') {
  return document.createElement(element);
}

function emptyEl(el) {
  while(el.firstChild)
  el.removeChild(el.firstChild);
}

function elem(selector, parent = document){
  let elem = isObj(parent) ? parent.querySelector(selector) : false;
  return elem ? elem : false;
}

function elems(selector, parent = document) {
  return isObj(parent) ? parent.querySelectorAll(selector) : [];
}

function pushClass(el, targetClass) {
  if (isObj(el) && targetClass) {
    let elClass = el.classList;
    elClass.contains(targetClass) ? false : elClass.add(targetClass);
  }
}

function deleteClass(el, targetClass) {
  if (isObj(el) && targetClass) {
    let elClass = el.classList;
    elClass.contains(targetClass) ? elClass.remove(targetClass) : false;
  }
}

function modifyClass(el, targetClass) {
  if (isObj(el) && targetClass) {
    const elClass = el.classList;
    elClass.contains(targetClass) ? elClass.remove(targetClass) : elClass.add(targetClass);
  }
}

function containsClass(el, targetClass) {
  if (isObj(el) && targetClass && el !== document ) {
    return el.classList.contains(targetClass) ? true : false;
  }
}

function isChild(node, parentClass) {
  let objectsAreValid = isObj(node) && parentClass && typeof parentClass == 'string';
  return (objectsAreValid && node.closest(parentClass)) ? true : false;
}

function elemAttribute(elem, attr, value = null) {
  if (value) {
    elem.setAttribute(attr, value);
  } else {
    value = elem.getAttribute(attr);
    return value ? value : false;
  }
}

function deleteChars(str, subs) {
  let newStr = str;
  if (Array.isArray(subs)) {
    for (let i = 0; i < subs.length; i++) {
      newStr = newStr.replace(subs[i], '');
    }
  } else {
    newStr = newStr.replace(subs, '');
  }
  return newStr;
}

function isBlank(str) {
  return (!str || str.trim().length === 0);
}

function isMatch(element, selectors) {
  if(isObj(element)) {
    if(selectors.isArray) {
      let matching = selectors.map(function(selector){
        return element.matches(selector)
      })
      return matching.includes(true);
    }
    return element.matches(selectors)
  }
}

function closestInt(goal, collection) {
  return collection.reduce(function (prev, curr) {
    return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
  });
}

function hasClasses(el) {
  if(isObj(el)) {
    const classes = el.classList;
    return classes.length
  }
}

function wrapEl(el, wrapper) {
  el.parentNode.insertBefore(wrapper, el);
  wrapper.appendChild(el);
}

function wrapText(text, context, wrapper = 'mark') {
  let open = `<${wrapper}>`;
  let close = `</${wrapper}>`;
  let escapedOpen = `%3C${wrapper}%3E`;
  let escapedClose = `%3C/${wrapper}%3E`;
  function wrap(context) {
    let c = context.innerHTML;
    let pattern = new RegExp(text, "gi");
    let matches = text.length ? c.match(pattern) : null;

    if(matches) {
      matches.forEach(function(matchStr){
        c = c.replaceAll(matchStr, `${open}${matchStr}${close}`);
        context.innerHTML = c;
      });

      const images = elems('img', context);

      if(images) {
        images.forEach(image => {
          image.src = image.src.replaceAll(open, '').replaceAll(close, '').replaceAll(escapedOpen, '').replaceAll(escapedClose, '');
        });
      }
    }
  }

  const contents = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "code", "td"];

  contents.forEach(function(c){
    const cs = elems(c, context);
    if(cs.length) {
      cs.forEach(function(cx, index){
        if(cx.children.length >= 1) {
          Array.from(cx.children).forEach(function(child){
            wrap(child);
          })
          wrap(cx);
        } else {
          wrap(cx);
        }
        // sanitize urls and ids
      });
    }
  });

  const hyperLinks = elems('a');
  if(hyperLinks) {
    hyperLinks.forEach(function(link){
      link.href = link.href.replaceAll(encodeURI(open), "").replaceAll(encodeURI(close), "");
    });
  }
}

function parseBoolean(string = "") {
  string = string.trim().toLowerCase();
  switch (string) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return undefined;
  }
}

function loadSvg(file, parent, path = iconsPath) {
  const link = new URL(`${path}${file}.svg`, root_url).href;
  fetch(link)
  .then((response) => {
    return response.text();
  })
  .then((svg_data) => {
    parent.innerHTML = svg_data;
  });
}

function copyToClipboard(str) {
  let copy, selection, selected;
  copy = createEl('textarea');
  copy.value = str;
  copy.setAttribute('readonly', '');
  copy.style.position = 'absolute';
  copy.style.left = '-9999px';
  selection = document.getSelection();
  doc.appendChild(copy);
  // check if there is any selected content
  selected = selection.rangeCount > 0 ? selection.getRangeAt(0) : false;
  copy.select();
  document.execCommand('copy');
  doc.removeChild(copy);
  if (selected) { // if a selection existed before copying
    selection.removeAllRanges(); // unselect existing selection
    selection.addRange(selected); // restore the original selection
  }
}
;
const snippet_actions = [
  {
    icon: 'copy',
    id: 'copy',
    title: copy_text,
    show: true
  },
  {
    icon: 'order',
    id: 'lines',
    title: toggle_line_numbers_text,
    show: true
  },
  {
    icon: 'carly',
    id: 'wrap',
    title: toggle_line_wrap_text,
    show: false
  },
  {
    icon: 'expand',
    id: 'expand',
    title: resize_snippet,
    show: false
  }
];

function addLines(block) {
  let text = block.textContent;
  const snippet_fragment = [];
  if (text.includes('\n') && block.closest('pre') && !block.children.length) {
    text = text.split('\n');
    text.forEach((text_node, index) => {
      if(text_node.trim().length) {
        const new_node = `
        <span class="line line-flex">
          <span class="ln">${index + 1}</span>
          <span class="cl">${text_node.trim()}</span>
        </span>`.trim();
        // snippet_fragment.push(':;:');
        snippet_fragment.push(new_node);
        block.closest('pre').className = 'chroma';
        pushClass(block, 'language-unknown');
        block.dataset.lang = not_set;
      }
    });

    block.innerHTML = snippet_fragment.join('').trim(' ');
  }
}

function wrapOrphanedPreElements() {
  const pres = elems('pre');
  Array.from(pres).forEach(function(pre){
    const parent = pre.parentNode;
    const is_orpaned = !containsClass(parent, highlight);
    if(is_orpaned) {
      const pre_wrapper = createEl();
      pre_wrapper.className = highlight;
      const outer_wrapper = createEl();
      outer_wrapper.className = highlight_wrap;
      wrapEl(pre, pre_wrapper);
      wrapEl(pre_wrapper, outer_wrapper);
    }
  })
  /*
  @Todo
  1. Add UI control to orphaned blocks
  */
}

wrapOrphanedPreElements();

function codeBlocks() {
  const marked_code_blocks = elems('code');
  const blocks = Array.from(marked_code_blocks).filter(function(block){
    addLines(block);
    return block.closest("pre") && !Array.from(block.classList).includes('noClass');
  }).map(function(block){
    return block
  });
  return blocks;
}

function codeBlockFits(block) {
  // return false if codeblock overflows
  const block_width = block.offsetWidth;
  const highlight_block_width = block.closest(`.${highlight}`).offsetWidth;
  return block_width <= highlight_block_width ? true : false;
}

function maxHeightIsSet(elem) {
  let max_height = elem.style.maxHeight;
  return max_height.includes('px')
}

function restrainCodeBlockHeight(lines) {
  const last_line = lines[max_lines-1];
  let max_code_block_height = full_height;
  if(last_line) {
    const last_line_pos = last_line.offsetTop;
    if(last_line_pos !== 0) {
      max_code_block_height = `${last_line_pos}px`;
      const codeBlock = lines[0].parentNode;
      const outer_block = codeBlock.closest(`.${highlight}`);
      const is_expanded = containsClass(outer_block, panel_expanded);
      if(!is_expanded) {
        codeBlock.dataset.height = max_code_block_height;
        codeBlock.style.maxHeight = max_code_block_height;
      }
    }
  }
}

const blocks = codeBlocks();

function collapseCodeBlock(block) {
  const lines = elems(line_class, block);
  const code_lines = lines.length;
  if (code_lines > max_lines) {
    const expand_dot = createEl()
    pushClass(expand_dot, panel_expand);
    pushClass(expand_dot, panel_from);
    expand_dot.title = "Toggle snippet";
    expand_dot.textContent = "...";
    const outer_block = block.closest('.highlight');
    window.setTimeout(function(){
      const expand_icon = outer_block.nextElementSibling.lastElementChild;
      deleteClass(expand_icon, panel_hide);
    }, 150)

    restrainCodeBlockHeight(lines);
    const highlight_element = block.parentNode.parentNode;
    highlight_element.appendChild(expand_dot);
  }
}

blocks.forEach(function(block){
  collapseCodeBlock(block);
})

function actionPanel() {
  const panel = createEl();
  panel.className = panel_box;

  snippet_actions.forEach(function(button) {
    // create button
    const btn = createEl('a');
    btn.href = '#';
    btn.title = button.title;
    btn.className = `icon panel_icon panel_${button.id}`;
    button.show ? false : pushClass(btn, panel_hide);
    // load icon inside button
    loadSvg(button.icon, btn);
    // append button on panel
    panel.appendChild(btn);
  });

  return panel;
}

function toggleLineNumbers(elems) {
  if(elems) {
    // mark the code element when there are no lines
    elems.forEach(elem => modifyClass(elem, 'pre_nolines'));
    restrainCodeBlockHeight(elems);
  }
}

function toggleLineWrap(elem) {
  modifyClass(elem, 'pre_wrap');
  // retain max number of code lines on line wrap
  const lines = elems('.ln', elem);
  restrainCodeBlockHeight(lines);
}

function copyCode(code_element) {

  const copy_btn = code_element.parentNode.parentNode.querySelector(`.${copy_id}`);
  const original_title = copy_btn.title;
  loadSvg('check', copy_btn);
  copy_btn.title = copied_text;

  // remove line numbers before copying
  code_element = code_element.cloneNode(true);
  const line_numbers = elems('.ln', code_element);
  line_numbers.length ? line_numbers.forEach(line => line.remove()) : false;

  // remove leading '$' from all shell snippets
  let lines = elems('span', code_element);
  lines.forEach(line => {
    const text = line.textContent.trim(' ');
    if(text.indexOf('$') === 0) {
      line.textContent = line.textContent.replace('$ ', '');
    }
  })
  const snippet = code_element.textContent.trim(' ');
  // copy code
  copyToClipboard(snippet);

  setTimeout(function() {
    copy_btn.title = original_title;
    loadSvg('copy', copy_btn);
  }, 2250);
}

(function codeActions(){
  const highlight_wrap_id = highlight_wrap;
  blocks.forEach(function(block){
    // disable line numbers if disabled globally
    show_lines === false ? toggleLineNumbers(elems('.ln', block)) : false;

    const highlight_element = block.parentNode.parentNode;
    // wrap code block in a div
    const highlight_wrapper = createEl();
    highlight_wrapper.className = highlight_wrap_id;

    wrapEl(highlight_element, highlight_wrapper);

    const panel = actionPanel();
    // show wrap icon only if the code block needs wrapping
    const wrap_icon = elem(`.${wrap_id}`, panel);
    codeBlockFits(block) ? false : deleteClass(wrap_icon, panel_hide);

    // append buttons
    highlight_wrapper.appendChild(panel);
  });

  function isItem(target, id) {
    // if is item or within item
    return target.matches(`.${id}`) || target.closest(`.${id}`);
  }

  function showActive(target, targetClass) {
    const target_element = target.matches(`.${targetClass}`) ? target : target.closest(`.${targetClass}`);

    deleteClass(target_element, active);
    setTimeout(function() {
      modifyClass(target_element, active)
    }, 50)
  }

  doc.addEventListener('click', function(event){
    // copy code block
    const target = event.target;
    const is_copy_icon = isItem(target, copy_id);
    const is_wrap_icon = isItem(target, wrap_id);
    const is_lines_icon = isItem(target, lines_id);
    const is_expand_icon = isItem(target, panel_expand);
    const is_actionable = is_copy_icon || is_wrap_icon || is_lines_icon || is_expand_icon;

    if(is_actionable) {
      event.preventDefault();
      showActive(target, 'icon');
      const code_element = target.closest(`.${highlight_wrap_id}`).firstElementChild.firstElementChild;
      let lineNumbers = elems('.ln', code_element);

      is_wrap_icon ? toggleLineWrap(code_element) : false;
      is_lines_icon ? toggleLineNumbers(lineNumbers) : false;

      if (is_expand_icon) {
        let this_code_block = code_element.firstElementChild;
        const outer_block = this_code_block.closest('.highlight');
        if(maxHeightIsSet(this_code_block)) {
          this_code_block.style.maxHeight = full_height;
          // mark code block as expanded
          pushClass(outer_block, panel_expanded)
        } else {
          this_code_block.style.maxHeight = this_code_block.dataset.height;
          // unmark code block as expanded
          deleteClass(outer_block, panel_expanded)
        }
      }

      is_copy_icon ? copyCode(code_element) : false;
    }
  });

  (function addLangLabel() {
    blocks.forEach(block => {
      let label = block.dataset.lang;
      const is_shell_based = shell_based.includes(label);
      if(is_shell_based) {
        const lines = elems(line_class, block);
        Array.from(lines).forEach(line => {
          line = line.lastElementChild;
          let line_contents = line.textContent.trim(' ');
          line_contents.indexOf('$') !== 0 && line_contents.trim(' ').length ? pushClass(line, 'shell') : false;
        });
      }

      label = label === 'sh' ? 'shell' : label;
      if(label !== "fallback") {
        const label_el = createEl();
        label_el.textContent = label;
        pushClass(label_el, 'lang');
        block.closest(`.${highlight_wrap}`).appendChild(label_el);
      }
    });
  })();
})();

;
function prefersColor(mode){
  return `(prefers-color-scheme: ${mode})`;
}

function systemMode() {
  if (window.matchMedia) {
    const prefers = prefersColor(dark);
    return window.matchMedia(prefers).matches ? dark : light;
  }
  return light;
}

function currentMode() {
  let acceptable_chars = light + dark;
  acceptable_chars = [...acceptable_chars];
  let mode = getComputedStyle(doc).getPropertyValue(key).replace(/\"/g, '').trim();

  return [...mode]
    .filter(letter => acceptable_chars.includes(letter))
    .join('');
}

function changeMode(is_dark_mode) {
  if(is_dark_mode) {
    bank.setItem(storageKey, light)
    elemAttribute(doc, mode_data, light);
  } else {
    bank.setItem(storageKey, dark);
    elemAttribute(doc, mode_data, dark);
  }
}


function pickModePicture(mode) {
  elems('picture').forEach(function(picture){
    let source = picture.firstElementChild;
    const picture_data = picture.dataset;
    const images = [picture_data.lit, picture_data.dark];
    source.src = mode == 'dark' ? images[1] : images[0];
  });
}

function setUserColorMode(mode = false) {
  const is_dark_mode = currentMode() == dark;
  const stored_mode = bank.getItem(storageKey);
  const sys_mode = systemMode();
  if(stored_mode) {
    mode ? changeMode(is_dark_mode) : elemAttribute(doc, mode_data, stored_mode);
  } else {
    mode === true ? changeMode(is_dark_mode) : changeMode(sys_mode!==dark);
  }
  const user_mode = doc.dataset.mode;
  doc.dataset.systemmode = sys_mode;
  user_mode ? pickModePicture(user_mode) : false;
}

setUserColorMode();
;
(function calcNavHeight(){
  return (elem('.nav_header').offsetHeight + 25);
})();

function toggleMenu(event) {
  const target = event.target;
  const is_toggle_control = target.matches(`.${toggle_id}`);
  const is_with_toggle_control = target.closest(`.${toggle_id}`);
  const show_instances = elems(`.${show_id}`) ? Array.from(elems(`.${show_id}`)) : [];
  const menu_instance = target.closest(`.${menu}`);

  function showOff(target, self = false) {
    show_instances.forEach(function(show_instance){
      !self ? deleteClass(show_instance, show_id) : false;
      show_instance !== target.closest(`.${menu}`) ? deleteClass(show_instance, show_id) : false;
    });
  }

  if(is_toggle_control || is_with_toggle_control) {
    const menu = is_with_toggle_control ? is_with_toggle_control.parentNode.parentNode : target.parentNode.parentNode;
    event.preventDefault();
    modifyClass(menu, show_id);
  } else {
    !menu_instance ? showOff(target) : showOff(target, true);
  }
}

(function markInlineCodeTags(){
  const code_blocks = elems('code');
  if(code_blocks) {
    code_blocks.forEach(function(code_block){
      if(!hasClasses(code_block)) {
        code_block.children.length ? false : pushClass(code_block, 'noClass');
      }
    });
  }
})();

function featureHeading(){
  // show active heading at top.
  const link_class = "section_link";
  const title_class = "section_title";
  const parent = elem(".aside");
  if(parent) {
    let active_heading = elem(`.${link_class}.${active}`);
    active_heading = active_heading ? active_heading : elem(`.${title_class}.${active}`);
    parent.scroll({
      top: active_heading.offsetTop,
      left: 0,
      // behavior: 'smooth'
    });
  }
}

function activeHeading(position, list_links) {
  let links_to_modify = Object.create(null);
  links_to_modify.active = list_links.filter(function(link) {
    return containsClass(link, active);
  })[0];

  // activeTocLink ? deleteClass

  links_to_modify.new = list_links.filter(function(link){
    return parseInt(link.dataset.position) === position
  })[0];

  if (links_to_modify.active != links_to_modify.new) {
    links_to_modify.active ? deleteClass(links_to_modify.active, active): false;
    pushClass(links_to_modify.new, active);
  }
};

setTimeout(() => {
  featureHeading();
}, 50);

function updateDate() {
  const date = new Date();
  const year = date.getFullYear().toString;
  const year_el = elem('.year');
  year_el ? year.textContent = year : false;
}

function customizeSidebar() {
  const tocActive = 'toc_active';
  const aside = elem('aside');
  const tocs = elems('nav', aside);
  if(tocs) {
    tocs.forEach(function(toc){
      toc.id = "";
      pushClass(toc, 'toc');
      if(toc.children.length >= 1) {
        const toc_items = Array.from(toc.children[0].children);

        const previous_heading = toc.previousElementSibling;
        previous_heading.matches(`.${active}`) ? pushClass(toc, tocActive) : false;

        toc_items.forEach(function(item){
          pushClass(item, 'toc_item');
          pushClass(item.firstElementChild, 'toc_link');
        });
      }
    });

    const current_toc = elem(`.${tocActive}`);

    if(current_toc) {
      const page_internal_links = Array.from(elems('a', current_toc));

      const page_ids = page_internal_links.map(function(link){
        return link.hash;
      });

      const link_positions = page_ids.map(function(id){
        const heading = document.getElementById(decodeURIComponent(id.replace('#','')));
        const position = heading.offsetTop;
        return position;
      });

      page_internal_links.forEach(function(link, index){
        link.dataset.position = link_positions[index]
      });

      window.addEventListener('scroll', function(e) {
        // this.setTimeout(function(){
        let position = window.scrollY;
        let active = closestInt(position, link_positions);
        activeHeading(active, page_internal_links);
        // }, 1500)
      });
    }
  }

  elems('p').forEach(function(p){
    const buttons = elems('.button', p);
    buttons.length > 1 ? pushClass(p, 'button_grid') : false;
  });
}

function markExternalLinks() {
  let links = elems('a');
  if(links) {
    Array.from(links).forEach(function(link){
      let target, rel, blank, noopener, attr1, attr2, url, is_external;
      url = new URL(link.href);
      // definition of same origin: RFC 6454, section 4 (https://tools.ietf.org/html/rfc6454#section-4)
      is_external = url.host !== location.host || url.protocol !== location.protocol || url.port !== location.port;
      if(is_external) {
        target = 'target';
        rel = 'rel';
        blank = '_blank';
        noopener = 'noopener';
        attr1 = elemAttribute(link, target);
        attr2 = elemAttribute(link, noopener);

        attr1 ? false : elemAttribute(link, target, blank);
        attr2 ? false : elemAttribute(link, rel, noopener);
      }
    });
  }
}

function sanitizeURL(url) {
  // removes any existing id on url
  const position_of_hash = url.indexOf(hash);
  if(position_of_hash > -1 ) {
    const id = url.substr(position_of_hash, url.length - 1);
    url = url.replace(id, '');
  }
  return url
}

function createDeepLinks() {
  let heading_nodes = [];

  [...Array(6).keys()].forEach(function(i){
    if(i) {
      Array.prototype.push.apply(heading_nodes, document.getElementsByTagName(`h${i+1}`));
    }
  });

  heading_nodes.forEach(node => {
    let link = createEl('a');
    let icon = createEl('img');
    icon.src = 'https://SJNlab.github.io/icons/link.svg';
    link.className = 'link icon';
    link.appendChild(icon);
    let id = node.getAttribute('id');
    if(id) {
      link.href = `${sanitizeURL(document.URL)}#${id}`;
      node.appendChild(link);
      pushClass(node, 'link_owner');
    }
  });
}

function copyFeedback(parent) {
  const copy_txt = document.createElement('div');
  const yanked = 'link_yanked';
  copy_txt.classList.add(yanked);
  copy_txt.innerText = copied_text;
  if(!elem(`.${yanked}`, parent)) {
    const icon = parent.getElementsByTagName('img')[0];
    const original_src = icon.src;
    icon.src = 'https://SJNlab.github.io/icons/check.svg';
    parent.appendChild(copy_txt);
    setTimeout(function() {
      parent.removeChild(copy_txt)
      icon.src = original_src;
    }, 2250);
  }
}

function copyHeadingLink() {
  let deeplink, deeplinks, new_link, parent, target;
  deeplink = 'link';
  deeplinks = elems(`.${deeplink}`);
  if(deeplinks) {
    document.addEventListener('click', function(event)
    {
      target = event.target;
      parent = target.parentNode;
      if (target && containsClass(target, deeplink) || containsClass(parent, deeplink)) {
        event.preventDefault();
        new_link = target.href != undefined ? target.href : target.parentNode.href;
        copyToClipboard(new_link);
        target.href != undefined ?  copyFeedback(target) : copyFeedback(target.parentNode);
      }
    });
  }
}

function makeTablesResponsive() {
  const tables = elems('table');
  if (tables) {
    tables.forEach(function(table){
      const table_wrapper = createEl();
      pushClass(table_wrapper, 'scrollable');
      wrapEl(table, table_wrapper);
    });
  }
}

function backToTop(){
  const toTop = elem("#toTop");
  window.addEventListener("scroll", () => {
    const last_known_scroll_pos = window.scrollY;
    if(last_known_scroll_pos >= 200) {
      toTop.style.display = "flex";
      pushClass(toTop, active);
    } else {
      deleteClass(toTop, active);
    }
  });
}

function lazyLoadMedia(elements = []) {
  elements.forEach(element => {
    let media_items = elems(element);
    if(media_items) {
      Array.from(media_items).forEach(function(item) {
        item.loading = "lazy";
      });
    }
  })
}

function loadActions() {
  updateDate();
  customizeSidebar();
  markExternalLinks();
  createDeepLinks();
  copyHeadingLink();
  makeTablesResponsive();
  backToTop();

  lazyLoadMedia(['iframe', 'img']);

  doc.addEventListener('click', event => {
    let target = event.target;
    let mode_class = 'color_choice';
    let is_mode_toggle = containsClass(target, mode_class);
    is_mode_toggle ? setUserColorMode(true) : false;
    toggleMenu(event);
  });
}

window.addEventListener('load', loadActions());

;
// add custom js in this file