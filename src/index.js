import './test';

import {Singleton} from "./moduls/patterns";
import {getColor, getColorFromMax} from "./moduls/interpolateColor";
import {D3Module} from "./moduls/d3Module/d3Module";
import './test'

const TYPE_K = "k";
const TYPE_K_COLOR = "#2a77b6";
// todo использовать для заливки главного элемента
const MAIN_COLOR = "#0f2f49";
// todo использовать для заливки выбранного элемента
const SELECT_COLOR = "#13a81b";
const SCENE = '#main-scene';


class Scheme2D extends Singleton {
    // Режим работы work/mode2/mode3/mode4
    mode = "work";
    // Данные
    data = [];
    /**
     * Выбранный элемент
     * @type {{index: null, id: null}}
     */
    select = {
        id: null,
        index: null
    };

    d3module = new D3Module();

    constructor({data, element, mode, description, size, fnTooltipItem, fnTooltipMain, fnClick}) {
        // Наследование Singleton
        super();
        this.data = data;
        this.element = element;
        // режим работы
        this.mode = mode;
        // информация для главного элемента
        this.description = description;

        // обработчики
        this.fnTooltipItem = fnTooltipItem;
        this.fnTooltipMain = fnTooltipMain;
        this.fnClick = fnClick;

        // инициализация плагина d3

        const d3_data = data.map(({status, length, diameter, type, id}, index) => {

            const newDatum = {
                status,
                type,
                id,
                color: getColor(index)
            }

            length && (newDatum.height = length);
            diameter && (newDatum.width = diameter);

            return newDatum
        })

        this.d3module.initScene({
            selector: element,
            width: size.width,
            height: size.height,
            data: d3_data,
            onClick: () => console.log('1211')
        });

        window.select = (id) => {
            this.d3module.selectElement(id)
        }

        window.deselect = (id) => {
            this.d3module.deselectElement()
        }

        window.resize = (size) => {
            this.d3module.resizeScene(size)
        }

        window.updateData = () => {
            Scheme2D.updateData([...window.tmp, {
                "id": "cf3cbde0-6545-11ea-9059-a55ec199cee12345-2gfdv1",
                "status": null,
                "work": 0,
                "length": 9.055,
                "type": "1",
                "data": {
                    "depth": 18110,
                    "alert": null,
                    "alert_text": null,
                }
            }]);
        }
    }

    /**
     * Изменение режима работы
     * @param mode
     */
    changeMode = (mode) => {
        this.mode = mode;
        this.data.forEach(({[mode]: val, type}, index) => {
            // обновить цвет элемента
            const color = mode === "work" ? getColor(val) : getColorFromMax(val);
            if (type !== TYPE_K) {
                this.d3module.updateColor({index, color})
            }
        })
    }

    /**
     * Выделение и зуммирование к элементу / снятие выделения
     * @param newId
     */
    selectItem = (newId = this.select.id) => {
        // индекс ранее выбраного элемента
        const oldIndex = this.select.index;
        // id ранее выбраного элемента
        const oldId = this.select.id;
        // индекс выброного
        const newIndex = this.data.findIndex(({id}) => id === newId);

        if (oldIndex === newIndex) {
            // если есть ранее выбранный элемент - сбросить его
            this.d3module.deselectElement(oldIndex);
        } else {
            this.d3module.selectElement(newIndex);
        }

        // обновление выбранного элемента (изменение/сброс)
        this.select = newId !== oldId
            ? {id: newId, index: newIndex}
            : {id: null, index: null};
    }

    resize = (size) => {
        console.log(size)
        this.d3module.resizeScene(size)
    }

    /**
     * Обновить данные
     * @param newData
     */
    updateData = (newData) => {
        const currentData = Scheme2D.instance.data;
        const mode = Scheme2D.getMode();
        const selectIndex = Scheme2D.instance.select.index;

        let updateColorMap = false;
        let updateStatusMap = false;
        let update = false;

        if ((currentData.length === 0 && newData.length !== 0) || (currentData.length !== 0 && newData.length === 0) ) {
            update = true;
        } else {

            if(currentData.length !== newData.length) {
                update = true;
            }

            try {
                if (currentData[0].id !== newData[0].id) update = true;
            } catch (e) {}
        }


        // обновить данные класса
        Scheme2D.instance.data = newData;
        // todo andrey обновить description

        console.log("newData",newData)
        // поменялась схема
        if (update) {
            // todo обновить схему
            const d3_data = newData.map(({status, length, diameter, type, }, index) => ({status, height: length, width: diameter, type, color: getColor(index)}))
            this.d3module.updateData(d3_data)
            if (Scheme2D.instance.select.id) Scheme2D.instance.selectItem();
        } else {
            // изминились данные
            newData.forEach(({[mode]: newVal, status: newStatus}, index) => {
                const currentVal = currentData[index][mode];
                const currentStatus = currentData[index][mode];
                const color = Scheme2D.getColor(index);
                // обновить цвет элемента (за исключением выделеных элементов)
                if (currentVal !== newVal && selectIndex !== index) {
                    this.d3module.updateColor({index, color});
                    updateColorMap = true;
                }
                if (currentStatus !== newStatus) {
                    this.d3module.updateColor({index, color});
                    updateStatusMap = true;
                }
            })
        }
    }

    toMaxZoom = () => {
        this.d3module.moveBrushToDefault();
    }

    /**
     * Получение html tooltip
     * @param index
     * @returns {string}
     */
    static getTooltip = (index) => {
        const instance = Scheme2D.instance;
        if (index === -1) {
            const data = instance.description;
            return instance.fnTooltipMain(data);
        }
        const mode = Scheme2D.getMode();
        const data = instance.data[index];

        const color = Scheme2D.getColor(index);
        return instance.fnTooltipItem(data, mode, color)
    }


    /**
     * Получение цвета элемента
     * @param index
     * @returns {string}
     */
    static getColor = (index) => {
        const mode = Scheme2D.getMode();
        const {[mode]: val, type} = Scheme2D.instance.data[index];
        if (type === TYPE_K) return TYPE_K_COLOR;

        return mode === "work" ? getColor(val) : getColorFromMax(val);
    }

    static onClickItem = (index) => {
        if (index === -1) return;

        const data = Scheme2D.instance.data[index];
        const {type, id} = data;
        Scheme2D.instance.fnClick(type, id, index);
    }

    /**
     * Статические методы для управления схемой
     */
    static init = (o) => new Scheme2D(o);
    static changeMode = (mode) => Scheme2D.instance.changeMode(mode);
    static selectItem = (id) => Scheme2D.instance.selectItem(id);
    static getMode = () => Scheme2D.instance.mode;
    static updateData = (data) => Scheme2D.instance.updateData(data);
    static resize = (size) => Scheme2D.instance.resize(size);
    static toMaxZoom = () => Scheme2D.instance.toMaxZoom();

}

window.Scheme2D = Scheme2D;

export {SELECT_COLOR, TYPE_K, TYPE_K_COLOR}
export {Scheme2D};
