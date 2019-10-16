
// Created new for each selection change
var ScalebarFormView = Backbone.View.extend({

    unit_symbols: [
        {unit: "PICOMETER", symbol: "pm"},
        {unit: "ANGSTROM", symbol: "Å"},
        {unit: "NANOMETER", symbol: "nm"},
        {unit: "MICROMETER", symbol: "µm"},
        {unit: "MILLIMETER", symbol: "mm"},
        {unit: "CENTIMETER", symbol: "cm"},
        {unit: "METER", symbol: "m"},
        {unit: "KILOMETER", symbol: "km"},
        {unit: "MEGAMETER", symbol: "Mm"},
        {unit: "GIGAMETER", symbol: "Gm"},
        {unit: "ASTRONOMICALUNIT", symbol: "ua"},
        {unit: "LIGHTYEAR", symbol: "ly"}
    ],

    template: JST["src/templates/scalebar_form_template.html"],

    initialize: function(opts) {

        // prevent rapid repetative rendering, when listening to multiple panels
        this.render = _.debounce(this.render);

        this.models = opts.models;
        var self = this;

        this.models.forEach(function(m){
            self.listenTo(m, 'change:scalebar change:pixel_size_x change:scalebar_label', self.render);
        });

        // this.$el = $("#scalebar_form");
    },

    events: {
        "submit .scalebar_form": "update_scalebar",
        "click .scalebar_label": "update_scalebar",
        "change .btn": "dropdown_btn_changed",
        "click .hide_scalebar": "hide_scalebar",
        "click .pixel_size_display": "edit_pixel_size",
        "keypress .pixel_size_input"  : "enter_pixel_size",
        "blur .pixel_size_input"  : "save_pixel_size",
    },

    // simply show / hide editing field
    edit_pixel_size: function() {
        $('.pixel_size_display', this.$el).hide();
        $(".pixel_size_input", this.$el).css('display','inline-block').focus();
    },
    done_pixel_size: function() {
        $('.pixel_size_display', this.$el).show();
        $(".pixel_size_input", this.$el).css('display','none').focus();
    },

    // If you hit `enter`, set pixel_size
    enter_pixel_size: function(e) {
        if (e.keyCode == 13) {
            this.save_pixel_size(e);
        }
    },

    // on 'blur' or 'enter' we save...
    save_pixel_size: function(e) {
        // save will re-render, but only if number has changed - in case not...
        this.done_pixel_size();

        var val = $(e.target).val();
        if (val.length === 0) return;
        var pixel_size = parseFloat(val);
        if (isNaN(pixel_size)) return;
        this.models.forEach(function(m){
            m.save('pixel_size_x', pixel_size);
        });
    },

    // Automatically submit the form when a dropdown is changed
    dropdown_btn_changed: function(event) {
        $(event.target).closest('form').submit();
    },

    hide_scalebar: function() {
        this.models.forEach(function(m){
            m.hide_scalebar();
        });
    },

    // called when form changes
    update_scalebar: function(event) {

        var $form = $('#scalebar_form form');

        var length = $('.scalebar-length', $form).val(),
            units = $('.scalebar-units span:first', $form).attr('data-unit'),
            position = $('.label-position span:first', $form).attr('data-position'),
            color = $('.label-color span:first', $form).attr('data-color'),
            show_label = $('.scalebar_label', $form).prop('checked'),
            font_size = $('.scalebar_font_size span:first', $form).text().trim();

        this.models.forEach(function(m){
            var sb = {show: true};
            if (length != '-') sb.length = parseInt(length, 10);
            sb.units = units;
            if (position != '-') sb.position = position;
            if (color != '-') sb.color = color;
            sb.show_label = show_label;
            if (font_size != '-') sb.font_size = font_size;

            m.save_scalebar(sb);
        });
        return false;
    },

    render: function() {
        var json = {show: false, show_label: false, unit_symbols: this.unit_symbols},
            hidden = false,
            sb;

        this.models.forEach(function(m){
            // start with json data from first Panel
            if (!json.pixel_size_x) {
                json.pixel_size_x = m.get('pixel_size_x');
                json.symbol = m.get('pixel_size_x_symbol');
            } else {
                pix_sze = m.get('pixel_size_x');
                // account for floating point imprecision when comparing
                if (json.pixel_size_x != '-' &&
                    json.pixel_size_x.toFixed(10) != pix_sze.toFixed(10)) {
                        json.pixel_size_x = '-';
                }
                if (json.symbol != m.get('pixel_size_x_symbol')) {
                    json.symbol = '-';
                }
            }
            sb = m.get('scalebar');
            // if panel has scalebar, combine into json
            if (sb) {
                // for first panel, json = sb
                if (!json.length) {
                    json.length = sb.length;
                    json.units = sb.units;
                    json.position = sb.position;
                    json.color = sb.color;
                    json.show_label = sb.show_label;
                    json.font_size = sb.font_size;
                }
                else {
                    // combine attributes. Use '-' if different values found
                    if (json.length != sb.length) json.length = '-';
                    if (json.units != sb.units) json.units = '-';
                    if (json.position != sb.position) json.position = '-';
                    if (json.color != sb.color) json.color = '-';
                    if (!sb.show_label) json.show_label = false;
                    if (json.font_size != sb.font_size) json.font_size = '-';
                }
            }
            // if any panels don't have scalebar - we allow to add
            if(!sb || !sb.show) hidden = true;
        });

        if (this.models.length === 0 || hidden) {
            json.show = true;
        }
        json.length = json.length || 10;
        json.units = json.units || 'MICROMETER';
        json.units_symbol = '-';
        if (json.units !== '-') {
            // find the symbol e.g. 'mm' from units 'MILLIMETER'
            json.units_symbol = this.unit_symbols.filter(function(u){return u.unit == json.units})[0].symbol;
        }
        json.position = json.position || 'bottomright';
        json.color = json.color || 'FFFFFF';
        json.font_size = json.font_size || 10;
        json.symbol = json.symbol || '-';

        var html = this.template(json);
        this.$el.html(html);

        return this;
    }
});