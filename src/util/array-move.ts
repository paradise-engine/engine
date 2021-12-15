export function arrayMove(arr: any[], oldIndex: number, newIndex: number) {
    const workingArr = arr.slice();
    if (newIndex >= workingArr.length) {
        let k = newIndex - workingArr.length + 1;
        while (k--) {
            workingArr.push(undefined);
        }
    }
    workingArr.splice(newIndex, 0, workingArr.splice(oldIndex, 1)[0]);
    return workingArr;
}
