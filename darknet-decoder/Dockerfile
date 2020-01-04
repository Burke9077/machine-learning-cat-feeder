FROM ubuntu:19.04

RUN apt-get update && \
  apt-get -qq install \
    build-essential \
    ffmpeg \
    git \
    gfortran \
    libtool \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    libavcodec-dev \
    libavformat-dev \
    libxvidcore-dev \
    libx264-dev \
    libgstreamer1.0-dev \
    libgstreamer-plugins-base1.0-dev \
    libv4l-dev \
    libswscale-dev \
    libgtk-3-dev \
    libcanberra-gtk* \
    libatlas-base-dev \
    make \
    pkg-config \
    python3 \
    python3-pip \
    unzip \
    wget \
    x11-apps

WORKDIR /root
RUN wget -O opencv.zip https://github.com/opencv/opencv/archive/4.0.0.zip
RUN wget -O opencv_contrib.zip https://github.com/opencv/opencv_contrib/archive/4.0.0.zip
RUN unzip opencv.zip
RUN unzip opencv_contrib.zip
RUN mv opencv-4.0.0 opencv
RUN mv opencv_contrib-4.0.0 opencv_contrib
WORKDIR /root/opencv
RUN mkdir build
WORKDIR /root/opencv/build
RUN apt-get -qq install cmake
RUN cmake -D CMAKE_BUILD_TYPE=RELEASE \
    -D CMAKE_INSTALL_PREFIX=/usr/local \
    -D OPENCV_EXTRA_MODULES_PATH=~/opencv_contrib/modules \
    -D WITH_GSTREAMER=ON \
    -D WITH_FFMPEG=ON \
    -D BUILD_TESTS=OFF \
    -D OPENCV_ENABLE_NONFREE=ON \
    -D INSTALL_PYTHON_EXAMPLES=OFF \
    -D BUILD_EXAMPLES=OFF .. && \
  make && \
  make install

WORKDIR /
RUN git clone https://github.com/AlexeyAB/darknet.git
WORKDIR /darknet
RUN mkdir build-release
WORKDIR /darknet/build-release
RUN cmake ..
RUN make
RUN make install

RUN mkdir /model
WORKDIR /model
COPY model/* ./
RUN mkdir /model/backup
COPY model/backup/* ./backup/

COPY requirements.txt .
RUN pip3 install -r requirements.txt
WORKDIR /darknet/build-release
