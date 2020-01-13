FROM ubuntu:19.04

# Fix any time zone issues
RUN apt-get update
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get -qqy install tzdata
RUN rm /etc/localtime
RUN echo "America/New_York" > /etc/timezone
RUN dpkg-reconfigure tzdata

RUN apt-get -qqy install \
    build-essential \
    cmake \
    curl \
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
    sudo \
    unzip \
    wget \
    x11-apps \
    ccache \
    libblas-dev \
    liblapack-dev \
    libgflags-dev \
    libprotobuf-dev \
    libeigen3-dev \
    libcaffe-cuda-dev \
    libhdf5-dev \
    libopenblas-dev \
    libogre-1.9-dev \
    libdc1394-22 \
    libdc1394-22-dev \
    libgoogle-glog-dev \
    liblapacke-dev \
    libjasperreports-java \
    libopencv-videoio-dev \
    libavresample-dev \
    libgtkglext1 \
    libgtkglext1-dev \
    libgtkglextmm-x11-1.2-0v5 \
    libgtkglextmm-x11-1.2-dev \
    libvtk6-qt-dev \
    libvtk6-dev \
    libtesseract-dev \
    python2 \
    python-numpy \
    python3-numpy \
    tesseract-ocr \
    libprotoc-dev \
    protobuf-compiler \
    python3-protobuf \
    openexr \
    mesa-common-dev

# Install cuda
WORKDIR /tmp
RUN wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu1804/x86_64/cuda-ubuntu1804.pin
RUN mv cuda-ubuntu1804.pin /etc/apt/preferences.d/cuda-repository-pin-600
RUN wget http://developer.download.nvidia.com/compute/cuda/10.2/Prod/local_installers/cuda-repo-ubuntu1804-10-2-local-10.2.89-440.33.01_1.0-1_amd64.deb
RUN dpkg -i cuda-repo-ubuntu1804-10-2-local-10.2.89-440.33.01_1.0-1_amd64.deb
RUN apt-key add /var/cuda-repo-10-2-local-10.2.89-440.33.01/7fa2af80.pub
RUN apt-get update
RUN apt --fix-broken install
RUN apt-get -qqy -o Dpkg::Options::="--force-overwrite" install --fix-broken cuda
RUN rm -rf /tmp/*

# Install cudnn
RUN mkdir /cudnn
WORKDIR /cudnn
COPY cudnn/ /cudnn/
RUN \
  dpkg -i cudnn-runtime.deb && \
  apt-get install -f && \
  dpkg -i cudnn-dev.deb && \
  apt-get install -f && \
  dpkg -i cudnn-samples.deb && \
  apt-get install -f && \
  rm -rf /cudnn

ENV PATH=/usr/local/cuda-10.2/bin${PATH:+:${PATH}}$
ENV LD_LIBRARY_PATH=/usr/local/cuda-10.2/lib64${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}

# Install OpenCV
WORKDIR /root
RUN \
  wget -O opencv.zip https://github.com/opencv/opencv/archive/4.2.0.zip && \
  wget -O opencv_contrib.zip https://github.com/opencv/opencv_contrib/archive/4.2.0.zip && \
  unzip opencv.zip && \
  unzip opencv_contrib.zip && \
  mv opencv-4.2.0 opencv && \
  mv opencv_contrib-4.2.0 opencv_contrib
RUN mkdir -p /root/opencv/build
WORKDIR /root/opencv/build
RUN cmake -D CMAKE_BUILD_TYPE=RELEASE \
    -D CMAKE_INSTALL_PREFIX=/usr/local \
    -D OPENCV_EXTRA_MODULES_PATH=~/opencv_contrib/modules \
    -D WITH_GSTREAMER=ON \
    -D WITH_CUDA=ON \
    -D WITH_CUDNN=ON \
    -D WITH_FFMPEG=ON \
    -D BUILD_TESTS=OFF \
    -D OPENCV_ENABLE_NONFREE=ON \
    -D INSTALL_PYTHON_EXAMPLES=OFF \
    -D BUILD_opencv_java=OFF \
    -D BUILD_JAVA=OFF \
    -D WITH_PROTOBUF=OFF \
    -D WITH_JASPER=OFF \
    -D BUILD_opencv_java_bindings_generator=OFF \
    -D BUILD_EXAMPLES=OFF .. && \
  make -j && \
  make install

# Install Darknet
WORKDIR /
RUN git clone https://github.com/AlexeyAB/darknet.git
WORKDIR /darknet
RUN \
  mkdir build-release && \
  sed -i 's/GPU=0/GPU=1/g' Makefile && \
  sed -i 's/OPENCV=0/OPENCV=1/g' Makefile && \
  sed -i '23iARCH= -gencode arch=compute_75,code=[sm_75,compute_75]' Makefile
WORKDIR /darknet/build-release
RUN cmake \
    .. && \
  make -j && \
  make install

# Copy in model
RUN mkdir /model
COPY model/ /model/

# Set command to run
COPY run.sh .
RUN chmod 555 run.sh
CMD /bin/bash run.sh
