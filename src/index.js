import './test';
import {D3Module} from "./d3Module/d3Module";

const d3module = new D3Module();
const data = window.tmp;

const d3_data = data.map(({id, status, length, diameter, type}) => (
    {
        status,
        height: length,
        width: diameter,
        type,
        id
    }
))

d3module.initScene({
    selector: '#main-scene',
    width: 400,
    height: 700,
    data: d3_data
})

window.resize = (size) => {
   d3module.resizeScene(size)
}

window.updateData = () => {
    d3module.updateData(window.tmpUpdate.map(({id, status, length, diameter, type}) => (
        {
            status,
            height: length,
            width: diameter,
            type,
            id
        }
    )));
}