/**
 * The setup view API
 */
const setupView = {
    log(text: string, level: string = null) {
        let style: string = "";
        if (level === "ok") {
            style = 'style="color: green"';
        } else if (level === "error") {
            style = 'style="color: red; font-weight: bold"';
        }
        $("#setup-log").append("<div " + style + ">" + text + "</div>");
    },

    done() {
        $("#setup-loadImg").hide();
    },
};
