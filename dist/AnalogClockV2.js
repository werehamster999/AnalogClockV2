class AnalogClock2 extends HTMLElement {

  set hass(hass) {

    if (!this.content) {

      // Create the initial ha-card
      this.card = this.appendChild(document.createElement('ha-card'));

      // Create the nested blank element nodes
      this.content = this.card.appendChild(document.createElement('div'));
      this.canvas = this.content.appendChild(document.createElement('canvas'));

      // Amend the outer content div element
      this.content.style.display = "flex";
      this.content.style.justifyContent = "center";
      this.content.style.padding = "5px";

      // Amend the inner content canvas element
      this.canvas.width = this._layout.diameter;
      this.canvas.height = this._layout.diameter;

      // Adjust radius to fit inside canvas
      var radius = (this.canvas.width < this.canvas.height) ? this.canvas.width / 2.1 : this.canvas.height / 2.1;

      // Find centre for drawing
      var ctx = this.canvas.getContext("2d");
      ctx.textAlign = "center";
      ctx.textBaseline = 'middle';
      ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

      //drawClock(ctx);

      //if (this.hide_SecondHand) {
      //  setInterval(drawClock, 10000, ctx);
      //} else {
      //  setInterval(drawClock, 1000, ctx);
      //}

      function drawClock(ctx) {
        try {

          var config = getConfig();

          if (config.timezone) { options = { timeZone: timezone } };

          var now = new Date();
          var year = now.toLocaleString('sv-SE', { year: 'numeric', timeZone: config.timezone });
          var month = now.toLocaleString('sv-SE', { month: 'numeric', timeZone: timezone });
          var day = now.toLocaleString('sv-SE', { day: 'numeric', timeZone: timezone });
          var hour = now.toLocaleString('sv-SE', { hour: 'numeric', timeZone: timezone });
          var minute = now.toLocaleString('sv-SE', { minute: 'numeric', timeZone: timezone });
          var second = now.toLocaleString('sv-SE', { second: 'numeric', timeZone: timezone });

          now = new Date(year, month - 1, day, hour, minute, second);

          drawFace(ctx, radius, color_Background);
          drawTicks(ctx, radius, color_Ticks);

          if (!hide_FaceDigits) { drawFaceDigits(ctx, radius, color_FaceDigits) };
          if (!hide_Date) { drawDate(ctx, now, locale, radius, color_Text) };
          if (!hide_WeekDay) { drawWeekday(ctx, now, locale, radius, color_Text) };
          if (!hide_WeekNumber) { drawWeeknumber(ctx, now, locale, radius, color_Text) };
          if (!hide_DigitalTime) { drawTime(ctx, now, locale, radius, color_DigitalTime, timezone) };

          var options = { hour: '2-digit', hour12: false };
          hour = now.toLocaleTimeString("sv-SE", options);
          options = { minute: '2-digit', hour12: false};

          // drawHandX(ctx, ang, length, width, color, style)  ang in degrees
          drawHand(ctx, (Number(hour) + Number(minute) / 60) * 30, radius * 0.5, radius / 20, color_HourHand, style_HourHand);
          drawHand(ctx, (Number(minute) + now.getSeconds() / 60) * 6, radius * 0.8, radius / 20, color_MinuteHand, style_MinuteHand);
          if (!hide_SecondHand) { drawHand(ctx, (now.getSeconds()) * 6, radius * 0.8, 0, color_SecondHand, style_SecondHand) };
        } catch (err) {

          ctx.font = '20px Sans-Serif';
          ctx.textAlign = "left";
          ctx.fillStyle = 'red';

          var message = err.message;
          var words = message.split(' ');
          var line = '';
          var maxWidth = canvas.width - 20;
          var lineHeight = 24;

          var x = maxWidth / 2;
          var y = -60;

          for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = ctx.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
              ctx.fillText(line, -x, y);
              line = words[n] + ' ';
              y += lineHeight;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, -x, y);
          ctx.stroke();
          ctx.textAlign = "center";
        }
      }

      function drawFace(ctx, radius, color) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.lineWidth = radius * 0.03;
        ctx.stroke();
      }

      function drawTicks(ctx, radius, color) {
        var ang;
        var num;
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        for (num = 1; num < 13; num++) {
          ang = num * Math.PI / 6;
          ctx.moveTo(Math.cos(ang) * radius, Math.sin(ang) * radius);
          ctx.lineTo(Math.cos(ang) * radius * 0.9, Math.sin(ang) * radius * 0.9);
          ctx.stroke();
        }
        ctx.lineWidth = 1;
        if (!hide_MinorTicks) {
          for (num = 1; num < 60; num++) {
            ang = num * Math.PI / 30;
            ctx.moveTo(Math.cos(ang) * radius, Math.sin(ang) * radius);
            ctx.lineTo(Math.cos(ang) * radius * 0.95, Math.sin(ang) * radius * 0.95);
            ctx.stroke();
          }
        }
      }

      function drawFaceDigits(ctx, radius, color) {
        var ang;
        var num;
        ctx.lineWidth = 2;
        ctx.fillStyle = color;
        ctx.font = Math.round(radius / 7) + 'px Sans-Serif';
        for (num = 1; num < 13; num++) {
          ang = (num * Math.PI / 6) - ((2 * Math.PI) / 12 * 3);
          ctx.fillText(num, Math.cos(ang) * radius * 0.8, Math.sin(ang) * radius * 0.8);
          ctx.stroke();
        }
      }

      function drawHand(ctx, ang, length, width, color, style) {

        // Omvandla ang till radianer
        var angrad = (ang - 90) * Math.PI / 180;
        width = width > 0 ? width : 1;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        switch (style) {
        default:
          var Coords = getCoords(length, 0, angrad)
          ctx.moveTo(Coords.x, Coords.y);
          Coords = getCoords(0, -width, angrad)
          ctx.lineTo(Coords.x, Coords.y);
          Coords = getCoords(-width * 1.5, 0, angrad);
          ctx.lineTo(Coords.x, Coords.y);
          Coords = getCoords(0, width, angrad);
          ctx.lineTo(Coords.x, Coords.y);
          ctx.closePath();
          ctx.fill();
          break;
        case 2:
          var Coords = getCoords(1, 0, angrad)
          ctx.moveTo(Coords.x, Coords.y);
          Coords = getCoords(length * 0.8, width, angrad)
          ctx.lineTo(Coords.x, Coords.y);
          Coords = getCoords(length, 0, angrad)
          ctx.lineTo(Coords.x, Coords.y);
          Coords = getCoords(length * 0.8, -width, angrad)
          ctx.lineTo(Coords.x, Coords.y);
          ctx.closePath();
          ctx.fill();
          break;
        case 3:
          ctx.lineWidth = 3;
          var Coords = getCoords(1, 0, angrad)
          ctx.moveTo(Coords.x, Coords.y);
          Coords = getCoords(length, 0, angrad)
          ctx.lineTo(Coords.x, Coords.y);
          ctx.closePath();
          ctx.fill();
          break;
        case 4:
          var Coords = getCoords(1, 0, angrad)
          ctx.moveTo(Coords.x, Coords.y);
          Coords = getCoords(length, 0, angrad)
          ctx.lineTo(Coords.x, Coords.y);
          Coords = getCoords(length, 0, angrad)
          ctx.closePath();
          ctx.moveTo(Coords.x, Coords.y);
          ctx.arc(Coords.x, Coords.y, length / 10, 0, 2 * Math.PI);
          ctx.fill();
          break;
        case 5:
          ctx.lineWidth = 2;
          var Coords = getCoords(-width * 1.5, 0, angrad)
          ctx.moveTo(Coords.x, Coords.y);
          Coords = getCoords(0, width, angrad)
          ctx.lineTo(Coords.x, Coords.y);
          Coords = getCoords(width * 2, width, angrad)
          ctx.lineTo(Coords.x, Coords.y);
          Coords = getCoords(width * 2, -width, angrad)
          ctx.lineTo(Coords.x, Coords.y);
          Coords = getCoords(0, -width, angrad)
          ctx.lineTo(Coords.x, Coords.y);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          Coords = getCoords(width * 2, width * 0.8, angrad)
          ctx.moveTo(Coords.x, Coords.y);
          Coords = getCoords(length, 0, angrad)
          ctx.lineTo(Coords.x, Coords.y);
          Coords = getCoords(width * 2, -width * 0.8, angrad)
          ctx.lineTo(Coords.x, Coords.y);
          break;
        case 6:
          var Coords = getCoords(length, 0, angrad);
          ctx.moveTo(Coords.x, Coords.y);
          Coords = getCoords(length * 0.8, width, angrad);
          ctx.lineTo(Coords.x, Coords.y);
          Coords = getCoords(length * 0.8, -width, angrad);
          ctx.lineTo(Coords.x, Coords.y);
          ctx.closePath();
          ctx.fill();
          break;
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, length / 40, 0, 2 * Math.PI);
        ctx.fillStyle = '#777777'
        ctx.fill();
        ctx.stroke();
      }

      function getCoords(xin, yin, angin) {
        // Convert xin and yin to polar and add angin
        var radius = Math.sqrt(xin * xin + yin * yin);
        var ang = Math.atan2(yin, xin) + angin;
        // Back to rectangular
        var xout = radius * Math.cos(ang);
        var yout = radius * Math.sin(ang);
        return {
          x: xout,
          y: yout,
        };
      }

      function drawWeekday(ctx, now, locale, radius, color) {
        ctx.font = Math.round(radius / 7) + 'px Sans-Serif';
        ctx.fillStyle = color
          if (showtimezone) {
            if (timezonedisplayname) {
              ctx.fillText(timezonedisplayname, 0, radius * 0.3);
            } else {
              ctx.fillText(timezone, 0, radius * 0.3);
            }
          } else {
            var options = {
              weekday: 'long'
            };
            ctx.fillText(now.toLocaleDateString(locale, options), 0, radius * 0.3);
          }
          ctx.stroke();
      }

      function drawWeeknumber(ctx, now, locale, radius, color) {
        ctx.font = Math.round(radius / 7) + 'px Sans-Serif';
        ctx.fillStyle = color
        var week = weekNumber();
        ctx.fillText(week, radius * -0.5, 0);
        ctx.stroke();
      }

      function drawTime(ctx, now, locale, radius, color, timezone) {
        var options = {
          hour: '2-digit',
          minute: '2-digit'
        };
        var timeString = now.toLocaleTimeString(locale, options);
        if (timeFormat) {
          var nowmoment = moment(now);
          timeString = nowmoment.format(timeFormat);
        }
        if (timeString.length > 5) {
          ctx.font = Math.round(radius / 5) + 'px Sans-Serif';
        } else {
          ctx.font = Math.round(radius / 3) + 'px Sans-Serif';
        }
        ctx.fillStyle = color;
        ctx.fillText(timeString, 0, radius * -0.4);
        ctx.stroke();
      }

      function drawDate(ctx, now, locale, radius, color) {
        ctx.font = Math.round(radius / 7) + 'px Sans-Serif';
        ctx.fillStyle = color
          if (dateFormat) {
            //"20111010T1020"
            var datestring = now.toLocaleString('sv-SE');
            //var datestring = '2021-01-10 10:08';
            var nowmoment = moment(datestring);
            ctx.fillText(nowmoment.format(dateFormat), 0, radius * 0.5);
          } else {
            ctx.fillText(now.toLocaleDateString(locale), 0, radius * 0.5);
          }
          ctx.stroke();
      }

      function weekNumber() {
        var date = new Date();
        date.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year.
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        // January 4 is always in week 1.
        var week1 = new Date(date.getFullYear(), 0, 4);
        // Adjust to Thursday in week 1 and count number of weeks from date to week1.
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
             - 3 + (week1.getDay() + 6) % 7) / 7);
      }

      function getDefaultLayout() {

        // Gets default values for the cards features
        //
        // Note:
        //  a) As the original based the size of a card on the clock diameter,
        //     we consider diamter as part of a card "layout"

        var defaultLayout = [];

        defaultLayout.diameter = 150;

        return defaultLayout;
      }

      function updateLayout(oldLayout, newLayout) {

        // Updates the layout, if changed
        //
        // Note:
        //  a) This does nothing for compatibility as the only "layout" property
        //     is the clock diameter which is not changeable in previous versions.

        var layout = oldLayout;

        return layout;
      }

      function getDefaultConfig() {

        // Gets default values for the clocks features

        var defaultConfig = [];

        defaultConfig.color_time = 'Silver';
        defaultConfig.color_text = 'Silver';
        defaultConfig.color_ticks = 'Silver';
        defaultConfig.color_hourhand = '#CCCCCC';
        defaultConfig.color_secondhand = 'Silver';
        defaultConfig.color_minutehand = '#EEEEEE';
        defaultConfig.color_background = getComputedStyle(document.documentElement).getPropertyValue('--primary-background-color');
        defaultConfig.color_facedigits = 'Silver';
        defaultConfig.color_digitaltime = '#CCCCCC';

        defaultConfig.locale = hass.language;
        defaultConfig.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        defaultConfig.dateformat = "";
        defaultConfig.timeformat = "";
        defaultConfig.timezonedisplayname = "";

        defaultConfig.show_timezone = false;

        defaultConfig.hide_minorticks = false;
        defaultConfig.hide_weeknumber = true;
        defaultConfig.hide_facedigits = false;
        defaultConfig.hide_date = false;
        defaultConfig.hide_weekday = false;
        defaultConfig.hide_digitaltime = false;
        defaultConfig.hide_secondhand = false;

        defaultConfig.style_hourhand = false;
        defaultConfig.style_minutehand = false;
        defaultConfig.style_secondhand = false;

        //defaultConfig.demo = false;

        return defaultConfig;

      }

      function updateConfig(oldConfig, newConfig) {

        // Updates the config, with values from the newConfig, if they exist
        //
        // Note:
        //  a) No validity checks are performed.
        //  b) Booleans are made using double-NOT-ing
        //  c) Non-booleans are copied straight over as is

        var config = oldConfig;

        // update colors
        if (newConfig.color_time) { config.color_time = newConfig.color_time };
        if (newConfig.color_text) { config.color_text = newConfig.color_text };
        if (newConfig.color_ticks) { config.color_ticks = newConfig.color_ticks };
        if (newConfig.color_hourhand) { config.color_hourhand = newConfig.color_hourhand };
        if (newConfig.color_secondhand) { config.color_secondhand = newConfig.color_secondhand };
        if (newConfig.color_minutehand) { config.color_minutehand = newConfig.color_minutehand };
        if (newConfig.color_background) { config.color_background = newConfig.color_background };
        if (newConfig.color_facedigits) { config.color_facedigits = newConfig.color_facedigits };
        if (newConfig.color_digitaltime) { config.color_digitaltime = newConfig.color_digitaltime };

        if (newConfig.locale) { config.locale = newConfig.locale };
        if (newConfig.dateformat) { config.dateFormat = newConfig.dateformat };
        if (newConfig.timeformat) { config.timeFormat = newConfig.timeformat };
        if (newConfig.timezonedisplayname) { config.timezonedisplayname = newConfig.timezonedisplayname };

        // Use !! to coerce values to boolean
        if (newConfig.show_timezone) { config.show_timezone = !!(newConfig.show_timezone) };

        // Use !! to coerce values to boolean
        if (newConfig.hide_date) { config.hide_date = !!(newConfig.hide_date) };
        if (newConfig.hide_weekday) { config.hide_weekday = !!(newConfig.hide_weekday) };
        if (newConfig.hide_minorticks) { config.hide_minorticks = !!(newConfig.hide_minorticks) };
        if (newConfig.hide_weeknumber) { config.hide_weeknumber = !!(newConfig.hide_weeknumber) };
        if (newConfig.hide_facedigits) { config.hide_facedigits = !!(newConfig.hide_facedigits) };
        if (newConfig.hide_secondhand) { config.hide_secondhand = !!(newConfig.hide_secondhand) };
        if (newConfig.hide_digitaltime) { config.hide_digitaltime = !!(newConfig.hide_digitaltime) };

        // Update styles

        if (newConfig.style_hourhand) { config.style_HourHand = newConfig.style_hourhand };
        if (newConfig.style_minutehand) { config.style_MinuteHand = newConfig.style_minutehand };
        if (newConfig.style_secondhand) { config.style_SecondHand = newConfig.style_secondhand };

        return config;
      }

      function updateThemes(oldThemes, newThemes) {

        // Updates the themes, with values from the newThemes, if they exist
        //
        // (This is current redundant as we don't parse themes recursively
        //  nor define any as by default.
        //
        // Note:
        //  a) Use simple concatination as theme selection always picks
        //     the last applicable theme anyway.

        var themes = [];

        themes = oldThemes.concat(newThemes);

        return themes;

      }

      function getDefaultThemes() {

        // Gets default values for the theme list

        var defaultThemes = [];
        return defaultThemes;

      }

      /* function getActiveTheme(dateTime, themes) {
      //
      // Returns an apprpriate set of configuration properties listed in the themes section, if it exists
      //
      // Note:
      //  a) The original version requires a time element to be listed, this version allows
      //     for properties to be added without a time element which allows clocks to have multiple
      //     "looks" with a definitive order in which they are applied.
      //       timed theme >> un-timed theme >> clock >> defaults
      //  b)

      var newTheme = [];

      if (themes) {
      try {
      for (var i = 0; i < themes.length; i++) {
      if (themes[i].time) {

      var startTime = new Date();
      var endTime = new Date();

      startTime.setHours((themes[i].time.split('-')[0]).split(':')[0]);
      startTime.setMinutes((themes[i].time.split('-')[0]).split(':')[1]);
      startTime.setSeconds(0);

      endTime.setHours((themes[i].time.split('-')[1]).split(':')[0]);
      endTime.setMinutes((themes[i].time.split('-')[1]).split(':')[1]);
      endTime.setSeconds(0);

      if ((endTime > startTime && (dateTime > startTime && dateTime < endTime)) || (endTime < startTime && (dateTime > startTime || dateTime < endTime))) {
      newTheme = themes[i];
      }
      } else {
      newTheme = themes[i];
      }
      }
      } catch (err) {}

      return newTheme;
      } */

    }
  }

  setConfig(config) {

    // Split up the configuration items into relevant objects

    this._layout = this.updateLayout(this.getDefaultLayout(), config);
    this._config = this.updateConfig(this.getDefaultConfig(), config);
    this._themes = this.updateThemes(this.getDefaultThemes(), config);

  }

  getCardSize() {
    return 3;
  }
}

customElements.define('analog-clock-v2', AnalogClock2);
