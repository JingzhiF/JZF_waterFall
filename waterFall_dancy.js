//注意：
//因使用了inspectionObserver对象，本瀑布流布局不适用于IE

const waterFall_dancy=(imageJson,imageWidth)=>{
        // console.log(imageJson)
        // 根据图片数量创建包裹img的外层div
        for (let i of imageJson) {
            let container = document.createElement('div')
            container.setAttribute('class', 'imgContainer')
            container.setAttribute('style', 'float:left')
            document.body.appendChild(container)
        }

        let imgContainer = document.getElementsByClassName('imgContainer')
        let len = imgContainer.length
        //设置图片的初始宽度
        const imgWidth = imageWidth
        //创建所有img对象，赋予假src值
        for (let i = 0; i < len; i++) {
            let arrnum = Math.floor(i / 50)
            let index = i % 50
            let img = document.createElement('img')
            img.setAttribute('data-src', imageJson[arrnum][index].imgUrl)
            //图片宽度200px
            img.setAttribute('style', `width:${imgWidth}px`)
            imgContainer[i].appendChild(img)
        }
        //当img元素进入交叉区域时，触发加载图片的回调，并取消交叉观察
        //设置缓冲池高度，超过缓冲池高度不加载
        //图片加载完成后触发缓冲池高度下降的回调
        const images = document.querySelectorAll('img')
        let bufferPool = 0
        let arrHeight = []

        let contextWidth = window.innerWidth
        //一行能容纳的图片数
        let numInLine = Math.floor(contextWidth / imgWidth)
        //设置一次懒加载的图片数量
        let lazyNum = 1
        //当前加载完成图片数量
        let loadedImgNum = 0
        //是否第一行加载完毕
        let firstLineLoaded = false
        //长度最小的哪一列的对象
        const minHeightRow = {}
        //绑定图片加载完成事件
        let bindImgLoaded = (img) => {
            img.onload = () => {
                //图片加载完成，缓冲池降低
                // bufferPool--
                //加载完成的图片数量增加
                loadedImgNum++
                //一次懒加载图片加载完成
                //需要给没有绑定交叉区域的img进行绑定
                if (!(loadedImgNum % lazyNum)) {
                    //如果第一行刚好加载完
                    //执行一次
                    //初始化arrHeight数组的内容
                    if (loadedImgNum == numInLine && !firstLineLoaded) {
                        console.log(loadedImgNum)
                        let minH = images[0].height
                        let index = 0
                        //初始化minHeightRow对象
                        minHeightRow.minH = minH
                        minHeightRow.index = index
                        //找到最小高度的列对象
                        //并记录arrHright列高度数组
                        for (let i = 0; i < numInLine; i++) {
                            let imgH = images[i].height
                            arrHeight.push(imgH)
                            if (minH > imgH) {
                                minHeightRow.minH = imgH
                                minHeightRow.index = i
                            }
                        }
                        firstLineLoaded = !firstLineLoaded
                    }
                    //第一行图片加载
                    if (!firstLineLoaded) bindIntersection()
                    else {
                        //下一个加载图片如果不是第一行的图片
                        //需要额外设置css属性
                        //然后再设置交叉区域观察
                        notFirstLine_setPosition(images[loadedImgNum])
                        // console.log(arrHeight,minHeightRow)
                    }
                    // setTimeout(bindIntersection, 800)
                }
            }
        }
        //非第一行图片加载完成的事件
        let notFirstLine_setPosition = (image) => {
            // setTimeout(() => {
            let data_src = image.getAttribute('data-src')
            image.setAttribute('src', data_src)
            image.onload = () => {
                image.style.position = 'absolute'
                image.style.left = images[minHeightRow.index].offsetLeft + 'px'
                image.style.top = minHeightRow.minH + 'px'
                //检验图片高度是否完成挂载
                // if (!image.height) console.log(image.height, '加载图片的高度为0！图片没有完成渲染')
                // console.log(minHeightRow.minH,images[minHeightRow.index].offsetLeft)
                //图片加载完成，则更新下面的内容（更新最短列）
                arrHeight[minHeightRow.index] += image.height
                let minH = arrHeight[0]
                let index = 0
                minHeightRow.minH = minH
                minHeightRow.index = index
                for (let i = 0; i < numInLine; i++) {
                    let rowH = arrHeight[i]
                    if (rowH < minH) {
                        minH = rowH
                        minHeightRow.minH = rowH
                        minHeightRow.index = i
                    }
                }
                bindIntersection()
            }
            // }, 1000)
        }
        //图片交叉区域触发的回调，这个回调专用于加载图片
        const loadImg = entries => {
            entries.forEach(entry => {
                //图片进入交叉区域，开始加载
                // console.log(entry)
                if (entry.isIntersecting) {
                    // if (bufferPool < 10) {
                    console.log(1)
                    // bufferPool++
                    const image = entry.target
                    //设置src，图片开始加载
                    const data_src = image.getAttribute('data-src')
                    image.setAttribute('src', data_src)
                    //绑定图片加载完成事件
                    bindImgLoaded(image)
                    //取消已经加载的img交叉区域观察
                    observer.unobserve(image)
                }
                //加载完成图片数量等于第一次加载，则装载图片高度的数组
                // if (loadedImgNum == imageRowNums) {
                //     let imgs = document.getElementsByTagName('img')
                //     for (let i of imgs) {
                //         arrHeight.push
                //     }
                // }
                // }
            })
        }
        //新建交叉区域对象
        const observer = new IntersectionObserver(loadImg)

        //为一次懒加载数量的图片添加交叉区域事件
        function bindIntersection() {
            for (let i = 0; i < lazyNum; i++) {
                observer.observe(images[i + loadedImgNum])
            }
        }
        bindIntersection()
}
